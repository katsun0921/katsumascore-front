import { PostHeader } from '@/components/features/Post/PostHeader/PostHeader'
import { PostHero } from '@/components/features/Post/PostHero/PostHero'
import { TitleMeta } from '@/components/features/Post/PostTitleMeta/PostTitleMeta'
import { GoodPoint } from '@/components/features/Post/PostGoodPoint/PostGoodPoint'
import { PostContent } from '@/components/features/Post/PostContent/PostContent'
import { ReviewSiteScores } from '@/components/features/ReviewSiteScores/ReviewSiteScores'
import { VodIntroduction } from '@/components/features/VodIntroduction/VodIntroduction'
import { ShareButtons } from '@/components/features/ShareButtons/ShareButtons'
import { Sidebar } from '@/components/layout/Sidebar/Sidebar'
import type { PostDetailProps } from './PostDetail.types'

export const PostDetail = ({ post, locale = 'ja', genres }: PostDetailProps) => {
  return (
    <div>

      {/* ── title.php 相当 ── */}
      <PostHeader
        category={post.category ?? ''}
        titleJa={post.title}
        titleEn={post.titleEn}
        filmStudios={post.TitleMeta?.filmStudios}
        productionStudios={post.TitleMeta?.productionStudios}
        releaseDate={post.TitleMeta?.releaseDate}
        rating={post.rating}
        copyright={post.TitleMeta?.copyright}
        score={post.score}
        comment={post.authorComment}
      />

      {/* ── PostHero：ポスター・トレーラー ── */}
      <PostHero
        titleJa={post.title}
        trailerYoutubeId={post.trailerYoutubeId}
        trailerEmbedCode={post.trailerEmbedCode}
        posterUrl={post.image ?? ''}
        description={post.excerpt}
      />

      {/* body: 最大幅・中央・flex（md以上） */}
      <div className='relative mx-auto mt-8 md:flex md:justify-between md:gap-12'>

        {/* main: メインカラム */}
        <div className='w-full min-w-0 md:w-[72%]'>

          {/* ── post-single.php → post-review.php 相当 ── */}
          <section
            className='relative mt-6 mb-8 border-3 border-b-[14px] border-black/10 p-4'
          >

            {/* 基本情報・キャスト情報 */}
            {(post.TitleMeta || (post.credits && post.credits.length > 0) || (post.actors && post.actors.length > 0)) && (
              <TitleMeta {...post.TitleMeta} credits={post.credits} actors={post.actors} locale={locale} />
            )}
          </section>

          {/* ── acf-good-point.php 相当 ── */}
          {post.goodPoints && post.goodPoints.length > 0 && (
            <GoodPoint points={post.goodPoints} locale={locale} />
          )}

          {/* ── the_content() 相当 ── */}
          <article className='my-8'>
            <PostContent content={post.content} />
          </article>

          {/* ── acf-review-site-scores.php 相当 ── */}
          {post.reviewSiteScores && (
            <ReviewSiteScores
              sites={post.reviewSiteScores.sites}
              updatedAt={post.reviewSiteScores.updatedAt}
              publishedDate={post.reviewSiteScores.publishedDate}
              locale={locale}
            />
          )}

          {/* ── post-introduce-vod.php 相当 ── */}
          {post.vodIntroduction && (
            <VodIntroduction {...post.vodIntroduction} locale={locale} />
          )}
        </div>

        {/* ── サイドバー ── */}
        <Sidebar
          locale={locale}
          profile={post.profile}
          toc={post.toc}
          pickupPosts={post.pickupPosts}
          highScorePosts={post.highScorePosts}
          workInfo={post.score !== undefined ? {
            score: post.score,
            title: locale === 'en' && post.titleEn ? post.titleEn : post.title,
            isCinema: post.isCinemaShowing,
            vod: post.streamingVods ? {
              unext:   post.streamingVods.some((v) => v.service === 'unext'),
              amazon:  post.streamingVods.some((v) => v.service === 'amazon'),
              hulu:    post.streamingVods.some((v) => v.service === 'hulu'),
              netflix: post.streamingVods.some((v) => v.service === 'netflix'),
              disney:  post.streamingVods.some((v) => v.service === 'disney'),
            } : undefined,
          } : undefined}
          relationPosts={post.relationPosts}
          isCinemaShowing={post.isCinemaShowing}
          titleJp={post.title}
          titleEn={post.titleEn}
          streamingVods={post.streamingVods}
          rentalServices={post.rentalServices}
          postsGroups={post.postsGroups}
          genres={genres}
        />
      </div>

      {/* ── sharing.php 相当 ── */}
      <ShareButtons
        url={post.shareUrl ?? post.slug}
        title={post.title}
        locale={locale}
      />
    </div>
  )
}
