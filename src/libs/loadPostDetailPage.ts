/**
 * 映画・アニメ・ドラマの記事詳細で共有する `getStaticPaths` / `getStaticProps` ファクトリ（ISR 300 秒）。
 */
// ISR: revalidate 300s. Shared getStaticPaths/Props logic for movie/anime/drama pages.
import type { GetStaticPaths, GetStaticProps } from 'next';
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
  buildActorTermIdMap,
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

/** キャスト名 → termId / taxType のシリアライズ可能なマップエントリ */
export type ActorTermEntry = {
  actorName: string;
  termId: number;
  taxType: 'actor' | 'person';
};

export type PostDetailPageProps = {
  post: PostDetailProps['post'];
  locale: string;
  genres: GenreNavTag[];
  /** CSR で otherWorks を取得するためのキャスト termId 情報 */
  actorTermEntries: ActorTermEntry[];
  /** 現在の記事 ID（otherWorks / vod-related フェッチ時に自記事を除外するため） */
  postId: number;
  /** CSR で VOD 関連記事を取得するための VOD ターム ID（存在する場合のみ） */
  vodTermId?: number;
};

/** 全ロケールの投稿スラッグから静的パスを生成する。`fallback: 'blocking'`。 */
export const makeGetStaticPaths = (): GetStaticPaths => async ({ locales }) => {
  const locs = (locales ?? ['ja', 'en']).filter((l: string) => l !== 'default');
  const paths: { params: { slug: string }; locale: string }[] = [];

  for (const loc of locs) {
    const posts = await getPosts({ per_page: 100 });
    for (const p of posts) {
      if (typeof p.slug === 'string') {
        paths.push({ params: { slug: p.slug }, locale: loc });
      }
    }
  }

  return { paths, fallback: 'blocking' };
};

/** 1 記事の詳細・目次・関連・サイド用データを組み立て、`revalidate: 300` で返す。 */
export const makeGetStaticProps = (): GetStaticProps<PostDetailPageProps> =>
  async ({ params, locale }) => {
    const slug = params?.slug;
    if (typeof slug !== 'string') return { notFound: true };

    const loc = locale === 'default' ? 'ja' : (locale ?? 'ja');
    const wpPost = await getPostBySlug(slug);
    if (!wpPost) return { notFound: true, revalidate: 60 };
    const wpAny = wpPost as Record<string, unknown>;
    const wpAcf = wpAny.acf as Record<string, unknown> | undefined;
    const postLang = detectLang(
      typeof wpAny.link === 'string' ? wpAny.link : undefined,
      typeof wpAcf?.lang === 'string' ? wpAcf.lang : undefined,
    );
    if (postLang !== loc) return { notFound: true, revalidate: 60 };

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
    if (!detail) return { notFound: true, revalidate: 60 };

    // _embedded['wp:term'] からキャスト名 → ターム ID のマップを構築する（CSR用にシリアライズして渡す）
    const parsedForActors = parseWPPostUnknown(wpPost);
    const actorTermIdMap = parsedForActors ? buildActorTermIdMap(parsedForActors) : new Map();
    const actorTermEntries: ActorTermEntry[] = detail.actors
      ? detail.actors
          .filter((actor) => actor.actorName !== undefined)
          .map((actor) => {
            const termInfo = actorTermIdMap.get(actor.actorName!.toLowerCase());
            if (!termInfo) return null;
            return { actorName: actor.actorName!, termId: termInfo.termId, taxType: termInfo.taxType };
          })
          .filter((e): e is ActorTermEntry => e !== null)
      : [];

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
        post: { ...detail, toc, profile, ...(franchises.length > 0 ? { franchises } : {}) },
        locale: loc,
        genres,
        actorTermEntries,
        postId: wpPost.id,
        ...(vodTermId !== undefined ? { vodTermId } : {}),
      },
      revalidate: 300,
    };
  };
