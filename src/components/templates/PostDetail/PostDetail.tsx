import { PostHeader } from '@/components/features/post/PostHeader/PostHeader'
import { PostHero } from '@/components/features/post/PostHero/PostHero'
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay'
import { ScoreWithRank } from '@/components/ui/Score/ScoreWithRank'
import { BasicInfo } from '@/components/features/BasicInfo/BasicInfo'
import { VideoEmbed } from '@/components/features/VideoEmbed/VideoEmbed'
import { GoodPoint } from '@/components/features/ArticleBlock/GoodPoint/GoodPoint'
import { Summary } from '@/components/features/ArticleBlock/Summary/Summary'
import { PostContent } from '@/components/features/PostContent/PostContent'
import { ReviewSiteScores } from '@/components/features/ArticleBlock/ReviewSiteScores/ReviewSiteScores'
import { VodIntroduction } from '@/components/features/VodIntroduction/VodIntroduction'
import { ShareButtons } from '@/components/features/ShareButtons/ShareButtons'
import { Sidebar } from '@/components/layout/Sidebar/Sidebar'
import type { PostDetailProps } from './PostDetail.types'

export const PostDetail = ({ post, locale = 'ja', genres }: PostDetailProps) => {
  return (
    <div>

      {/* ── title.php 相当：タイトル・カテゴリ・メタ情報 ── */}
      <PostHeader
        category={post.category ?? ''}
        titleJa={post.title}
        titleEn={post.titleEn}
        filmStudios={post.basicInfo?.filmStudios}
        productionStudios={post.basicInfo?.productionStudios}
        releaseDate={post.basicInfo?.releaseDate}
        rating={post.rating}
        copyright={post.basicInfo?.copyright}
      />

      {/* ── PostHero：ポスター・トレーラー・スコア ── */}
      {post.score !== undefined && post.authorComment && (
        <PostHero
          titleJa={post.title}
          trailerYoutubeId={post.trailerYoutubeId}
          trailerEmbedCode={post.trailerEmbedCode}
          posterUrl={post.image ?? ''}
          description={post.excerpt}
          score={post.score}
          scoreMax={SCORE_DISPLAY_MAX}
          authorComment={post.authorComment}
        />
      )}

      {/* body: 最大幅・中央・flex（md以上） */}
      <div className='relative mx-auto mt-8 md:flex md:justify-between md:gap-12'>

        {/* main: メインカラム */}
        <div className='w-full min-w-0 md:w-[72%]'>

          {/* ── post-single.php → post-review.php 相当 ── */}
          <section
            className='relative mt-6 mb-8 border-3 border-b-[14px] border-black/10 p-4'
          >

            {/* 基本情報・キャスト情報 */}
            {(post.basicInfo || (post.credits && post.credits.length > 0) || (post.actors && post.actors.length > 0)) && (
              <BasicInfo {...post.basicInfo} credits={post.credits} actors={post.actors} locale={locale} />
            )}
          </section>

          {/* ── acf-good-point.php 相当 ── */}
          {post.goodPoints && post.goodPoints.length > 0 && (
            <GoodPoint points={post.goodPoints} locale={locale} />
          )}

          {/* ── acf-summary.php 相当 ── */}
          {post.summary && (
            <Summary
              text={post.summary.text}
              refUrl={post.summary.refUrl}
              refLabel={post.summary.refLabel}
              locale={locale}
            />
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
