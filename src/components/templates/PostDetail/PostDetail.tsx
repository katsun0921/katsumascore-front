import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumbs } from '@/components/features/Breadcrumbs';
import { PostHeader } from '@/components/features/Post/PostHeader';
import { PostHero } from '@/components/ui-section/PostPage/PostHero';
import { TitleMeta } from '@/components/features/Post/PostTitleMeta';
import { GoodPoint } from '@/components/ui-section/PostPage/PostGoodPoint';
import { TableOfContents } from '@/components/features/Post/TableOfContents';
import { PostContent } from '@/components/ui-section/PostPage/PostContent';
import { ReviewSiteScores } from '@/components/features/ReviewSiteScores';
import { CinemaCheck } from '@/components/features/CinemaCheck';
import { CinemaIntroduction } from '@/components/ui-section/CinemaIntroduction';
import { VodIntroduction } from '@/components/ui-section/VodIntroduction';
import { ShareButtons } from '@/components/ui-parts/ShareButtons';
import { Sidebar } from '@/components/ui-layout/Sidebar';
import { PostDate } from '@/components/ui-section/PostDate';
import { PostDetailFranchises } from '@/components/ui-section/PostDetailFranchises';
import { useLocale } from '@/i18n/provider';
import { useHighScorePosts } from '@/hooks/useHighScorePosts';
import { useVodRelatedPosts } from '@/hooks/useVodRelatedPosts';
import type { ReactNode } from 'react';
import type { PostDetailProps } from './PostDetail.types';

export const PostDetail = ({ post, genres, actorTermEntries, postId, vodTermId }: PostDetailProps) => {
  const locale = useLocale();
  const workTitle =
    locale === 'en' ? (post.originalTitle ?? post.title) : post.title;

  const { posts: highScorePosts, loading: highScoreLoading } = useHighScorePosts();
  const { posts: vodRelatedPosts, loading: vodRelatedLoading } = useVodRelatedPosts(vodTermId, postId ?? 0);

  let vodIntroductionSection: ReactNode = null;
  if (post.vodIntroduction) {
    const { title: vodWorkTitle, ...vodRest } = post.vodIntroduction;
    const vodTitle =
      locale === 'en' ? (post.originalTitle ?? vodWorkTitle) : vodWorkTitle;
    const relatedPosts = vodRelatedPosts.length > 0 ? vodRelatedPosts : vodRest.relatedPosts;
    vodIntroductionSection = (
      <VodIntroduction
        {...vodRest}
        title={vodTitle}
        relatedPosts={relatedPosts}
        relatedPostsLoading={vodRelatedLoading}
      />
    );
  }

  return (
    <PageLayout>
      <div className='bg-[linear-gradient(to_bottom,var(--color-secondary),var(--color-primary-dark))] px-4 pb-4'>

        {/* PostHeader：記事タイトル/公式タイトル/スタジオなど主要なヘッダー情報を表示 */}
        <PostHeader
          category={post.category ?? ''}
          titleOfficial={post.title}
          titleOriginal={post.originalTitle}
          filmStudios={post.TitleMeta?.filmStudios}
          productionStudios={post.TitleMeta?.productionStudios}
          releaseDate={post.TitleMeta?.releaseDate}
          copyright={post.TitleMeta?.copyright}
          score={post.score}
          comment={post.authorComment}
        />

        {/* ── PostHero：ポスター・トレーラー ── */}
        <PostHero
          title={post.title}
          trailerYoutubeId={post.trailerYoutubeId}
          trailerEmbedCode={post.trailerEmbedCode}
          posterUrl={post.image ?? ''}
          tagline={post.authorComment}
          description={post.summary?.text ?? ''}
          refUrl={post.summary?.refUrl}
          refLabel={post.summary?.refLabel}
          genres={post.heroGenres}
          tags={post.heroTags}
        />
      </div>
      {/* body: 最大幅・中央・flex（md以上） */}
      <div className='md:flex relative mx-auto mt-8 pb-8'>

        {/* main: メインカラム */}
        <div className='w-full min-w-0 px-4'>
          <CinemaCheck isCinemaShowing={post.isCinemaShowing ?? false} title={workTitle} />

          {/* ── post-single.php → post-review.php 相当 ── */}
          <section
            className='relative mb-8'
          >

            {/* 基本情報・キャスト情報 */}
            {(post.TitleMeta || (post.credits && post.credits.length > 0) || (post.actors && post.actors.length > 0)) && (
              <TitleMeta {...post.TitleMeta} credits={post.credits} actors={post.actors} actorTermEntries={actorTermEntries} postId={postId} />
            )}
          </section>

          {/* ── acf-good-point.php 相当 ── */}
          {post.goodPoints && post.goodPoints.length > 0 && (
            <GoodPoint points={post.goodPoints} score={post.score} />
          )}

          {/* ── 目次（GoodPointの直下） ── */}
          {post.toc && post.toc.length > 0 && (
            <TableOfContents items={post.toc} />
          )}

          {/* ── the_content() 相当 ── */}
          <article className='my-8'>
            <PostContent content={post.content} />
          </article>

          <PostDate publishedAt={post.publishedAt} updatedAt={post.updatedAt} />
          <ShareButtons
            url={post.shareUrl ?? post.slug}
            title={workTitle}
          />

          {post.reviewSiteScores && (
            <ReviewSiteScores
              sites={post.reviewSiteScores.sites}
              updatedAt={post.reviewSiteScores.updatedAt}
              publishedDate={post.reviewSiteScores.publishedDate}
            />
          )}

          {post.cinemaIntroduction && (
            <CinemaIntroduction
              title={post.title}
              isShowing={post.isCinemaShowing ?? false}
              {...post.cinemaIntroduction}
            />
          )}

          {vodIntroductionSection}

          {post.franchises && post.franchises.length > 0 && (
            <div className='mt-8'>
              <PostDetailFranchises franchises={post.franchises} />
            </div>
          )}

          <div className='mt-3'>
            <Breadcrumbs
              title={post.title}
              category={post.category}
              type={post.type}
              lang={post.lang}
            />
          </div>
        </div>

        {/* ── サイドバー ── */}
        <div className='md:w-[320px] shrink-0'>
          <Sidebar
            profile={post.profile}
            pickupPosts={post.pickupPosts}
            highScorePosts={highScorePosts.length > 0 ? highScorePosts : post.highScorePosts}
            highScoreLoading={highScoreLoading}
            relationPosts={post.relationPosts}
            isCinemaShowing={post.isCinemaShowing}
            title={workTitle}
            streamingVods={post.streamingVods}
            postsGroups={post.postsGroups}
            genres={genres}
          />
        </div>
      </div>
    </PageLayout>
  );
};
