import { PageLayout } from '@/components/templates/PageLayout';
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
import type { PostDetailProps } from './PostDetail.types';

export const PostDetail = ({ post, genres }: PostDetailProps) => {
  return (
    <PageLayout>
      <div className='bg-[linear-gradient(to_bottom,var(--color-secondary),var(--color-primary-dark))] px-4 pb-4'>
        {/* ── title.php 相当 ── */}
        <PostHeader
          category={post.category ?? ''}
          titleOfficial={post.title}
          titleOriginal={post.titleEn}
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
          <CinemaCheck isCinemaShowing={post.isCinemaShowing ?? false} titleJp={post.title} />

          {/* ── post-single.php → post-review.php 相当 ── */}
          <section
            className='relative mb-8'
          >

            {/* 基本情報・キャスト情報 */}
            {(post.TitleMeta || (post.credits && post.credits.length > 0) || (post.actors && post.actors.length > 0)) && (
              <TitleMeta {...post.TitleMeta} credits={post.credits} actors={post.actors} />
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
            title={post.title}
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

          {post.vodIntroduction && (
            <VodIntroduction {...post.vodIntroduction} />
          )}
        </div>

        {/* ── サイドバー ── */}
        <div className='md:w-[320px] shrink-0 px-4'>
          <Sidebar
            profile={post.profile}
            pickupPosts={post.pickupPosts}
            highScorePosts={post.highScorePosts}
            relationPosts={post.relationPosts}
            isCinemaShowing={post.isCinemaShowing}
            titleJp={post.title}
            titleEn={post.titleEn}
            streamingVods={post.streamingVods}
            postsGroups={post.postsGroups}
            genres={genres}
          />
        </div>
      </div>
    </PageLayout>
  );
};
