/**
 * 映画・アニメ・ドラマの記事詳細で共有する `getStaticPaths` / `getStaticProps` ファクトリ（SSG、日次ビルド）。
 */
// SSG: 詳細は日次ビルド、未生成パスはblocking生成。
import type { GetStaticProps } from 'next';
import { makePostStaticPaths, formatVodSnapshotDate } from '@/libs/api/wordpress/staticPaths';
import { pickRandom } from '@/libs/highscore';
import { isStrictWpBuild } from '@/libs/api/wordpress/transport';
import {
  getPostBySlug,
  getPosts,
  getRelatedPosts,
  parseWPPostUnknown,
  mapWPPostToPost,
  getPostsByFranchiseTermId,
  extractFranchiseTermsFromParsedWp,
} from '@/libs/api/wordpress';
import { detectLang } from '@/libs/api/wordpress/lang';
import { extractToc } from '@/libs/toc';
import {
  buildPostDetailFromWp,
  buildActorPersonIdMap,
  extractRelationPostIds,
  extractPostsGroupSpecsFromWp,
  extractVodIntroductionRelatedPostsTermId,
} from '@/libs/buildPostDetailFromWp';
import { loadStaticGenreNavTags } from '@/libs/getStaticGenres';
import type { GenreNavTag } from '@/components/features/GenreNav/GenreNav';
import type { PostDetailProps } from '@/components/templates/PostDetail/PostDetail.types';
import type { Post } from '@/types/post';
import type { TRelationPostItem } from '@/components/features/RelationPost';
import type { TPostsGroupItem } from '@/components/features/Post/PostsGroup';
import type { PostDetailFranchiseItem } from '@/components/templates/PostDetail/PostDetail.types';

/** キャスト名 → person CPT の投稿 ID のシリアライズ可能なマップエントリ */
export type ActorTermEntry = {
  actorName: string;
  personId: number;
};

export type PostDetailPageProps = {
  post: PostDetailProps['post'];
  locale: string;
  genres: GenreNavTag[];
  /** CSR で otherWorks を取得するためのキャスト termId 情報 */
  actorTermEntries: ActorTermEntry[];
  /** 現在の記事 ID（キャストの他作品から自記事を除外するため） */
  postId: number;
};

/** 記事の正規カテゴリ・言語に一致する公開パスを全件列挙する。 */
export const makeGetStaticPaths = makePostStaticPaths;

/** 1 記事の詳細・目次・関連・サイド用データを組み立て、再検証間隔を指定せず返す。 */
export const makeGetStaticProps = (): GetStaticProps<PostDetailPageProps> =>
  async ({ params, locale }) => {
    const slug = params?.slug;
    if (typeof slug !== 'string') return { notFound: true };

    const loc = locale === 'default' ? 'ja' : (locale ?? 'ja');
    const wpPost = await getPostBySlug(slug);
    if (!wpPost) return { notFound: true };
    const wpAny = wpPost as Record<string, unknown>;
    const wpAcf = wpAny.acf as Record<string, unknown> | undefined;
    const postLang = detectLang(
      typeof wpAny.link === 'string' ? wpAny.link : undefined,
      typeof wpAcf?.lang === 'string' ? wpAcf.lang : undefined,
    );
    if (postLang !== loc) return { notFound: true };

    const acfRecord = wpPost.acf as Record<string, unknown> | undefined;
    const relationIds = extractRelationPostIds(acfRecord);
    const groupSpecs = extractPostsGroupSpecsFromWp(wpPost);
    const groupIdSet = new Set(groupSpecs.flatMap((g) => g.ids));
    const allFetchIds = [...new Set([...relationIds, ...groupIdSet])];
    const relatedRaw = allFetchIds.length > 0 ? await getRelatedPosts(allFetchIds) : [];

    const relationPosts: TRelationPostItem[] = [];
    for (const id of relationIds) {
      const raw = relatedRaw.find((p) => p.id === id);
      if (!raw) continue;
      const m = mapWPPostToPost(raw);
      if (!m) continue;
      const item: TRelationPostItem = {
        id: raw.id,
        title: m.title,
        href: m.slug,
      };
      if (m.image) item.imageUrl = m.image;
      relationPosts.push(item);
    }

    const postsGroups: TPostsGroupItem[] = groupSpecs
      .map((g) => ({
        heading: g.heading,
        ...(g.description ? { description: g.description } : {}),
        posts: g.ids
          .map((id) => {
            const raw = relatedRaw.find((p) => p.id === id);
            if (!raw) return null;
            const m = mapWPPostToPost(raw);
            if (!m) return null;
            if (m.lang !== loc) return null;
            const { content: _c, ...rest } = m;
            void _c;
            return rest as Post;
          })
          .filter((p): p is Post => p !== null),
      }))
      .filter((g) => g.posts.length > 0);

    const vodTermId = extractVodIntroductionRelatedPostsTermId(wpPost);

    // フランチャイズ関連記事を取得する（最大3件ランダム、自記事除外）
    const parsedForFranchise = parseWPPostUnknown(wpPost);
    const franchiseTerms = parsedForFranchise ? extractFranchiseTermsFromParsedWp(parsedForFranchise) : [];
    const franchises: PostDetailFranchiseItem[] = [];
    for (const term of franchiseTerms) {
      const rawPosts = await getPostsByFranchiseTermId(term.id, 100);
      const termPosts: Post[] = rawPosts
        .map((p) => {
          const m = mapWPPostToPost(p);
          if (!m) return null;
          if (m.lang !== loc) return null;
          const { content: _c, ...rest } = m;
          void _c;
          return rest as Post;
        })
        .filter((p): p is Post => p !== null && p.slug !== slug);
      // Fisher-Yates シャッフルで最大3件をランダム選択
      for (let i = termPosts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [termPosts[i], termPosts[j]] = [termPosts[j], termPosts[i]];
      }
      franchises.push({ id: term.id, title: term.name, slug: term.slug, posts: termPosts.slice(0, 3) });
    }

    const detail = buildPostDetailFromWp({
      wp: wpPost,
      locale: loc,
      relationPosts: relationPosts.length > 0 ? relationPosts : undefined,
      postsGroups: postsGroups.length > 0 ? postsGroups : undefined,
    });
    if (!detail) {
      if (isStrictWpBuild()) throw new Error('Published WP post could not be normalized');
      return { notFound: true };
    }

    // ACF actors_filed.actor（person CPT リレーション）からキャスト名 → person ID のマップを構築する（CSR用にシリアライズして渡す）
    const parsedForActors = parseWPPostUnknown(wpPost);
    const actorPersonIdMap = parsedForActors ? buildActorPersonIdMap(parsedForActors) : new Map();
    const actorTermEntries: ActorTermEntry[] = detail.actors
      ? detail.actors
          .filter((actor) => actor.actorName !== undefined)
          .map((actor) => {
            const personId = actorPersonIdMap.get(actor.actorName!.toLowerCase());
            if (personId === undefined) return null;
            return { actorName: actor.actorName!, personId };
          })
          .filter((e): e is ActorTermEntry => e !== null)
      : [];

    // 配信情報・VOD関連記事を同じスナップショットとして保存する。
    const vodRelatedRaw = vodTermId !== undefined ? await getPosts({ per_page: 12, vod: vodTermId }) : [];
    const vodRelatedPosts = vodRelatedRaw.filter((raw) => raw.id !== wpPost.id)
      .map(mapWPPostToPost)
      .filter((post): post is NonNullable<typeof post> => post !== null && post.lang === loc)
      .map(({ content: _content, ...post }) => { void _content; return post as Post; });
    if (detail.vodIntroduction) {
      detail.vodIntroduction.relatedPosts = pickRandom(vodRelatedPosts, 3);
    }
    const vodSnapshotDate = formatVodSnapshotDate();
    const toc = extractToc(detail.content);

    const genres = await loadStaticGenreNavTags(loc);

    const excerptTrimmed = detail.excerpt.trim();
    const commentTrimmed = detail.authorComment?.trim() ?? "";
    const profile = {
      ...(excerptTrimmed.length > 0 ? { excerpt: excerptTrimmed } : {}),
      ...(commentTrimmed.length > 0 ? { comment: commentTrimmed } : {}),
    };

    return {
      props: {
        post: { ...detail, vodSnapshotDate, toc, profile, ...(franchises.length > 0 ? { franchises } : {}) },
        locale: loc,
        genres,
        actorTermEntries,
        postId: wpPost.id,
      },
    };
  };
