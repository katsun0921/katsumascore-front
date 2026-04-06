import { ArticleHeader } from '@/components/features/ArticleHeader/ArticleHeader'
import { ArticleMeta } from '@/components/features/ArticleMeta/ArticleMeta'
import { ScoreWithRank } from '@/components/ui/Score/ScoreWithRank'
import { BasicInfo } from '@/components/features/BasicInfo/BasicInfo'
import { ActorsInfo } from '@/components/features/ArticleBlock/ActorsInfo/ActorsInfo'
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
  const categories = post.category
    ? [{ label: post.category, href: `/category/${post.category}` }]
    : []

  return (
    <div>

      {/* ── title.php 相当：ヒーロー画像＋タイトル＋カテゴリ ── */}
      <ArticleHeader
        titleJp={post.title}
        titleEn={post.titleEn}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        categories={categories}
        imageUrl={post.image ?? undefined}
        locale={locale}
      />

      {/* body: 最大幅・中央・flex（md以上） */}
      <div className='w-[90%] max-w-[1200px] mx-auto mt-8 relative md:flex md:justify-between md:gap-12'>

        {/* main: メインカラム */}
        <div className='w-full min-w-0 md:w-[72%]'>

          {/* ── date.php 相当：公開日・更新日 ── */}
          <ArticleMeta
            releaseDate={post.basicInfo?.releaseDate}
            officialUrl={post.basicInfo?.officialUrl}
            copyright={post.basicInfo?.copyright}
            titleEn={post.titleEn}
            officialSns={post.basicInfo?.officialSns}
            locale={locale}
          />

          {/* ── post-single.php → post-review.php 相当 ── */}
          <section className='relative border-4 border-b-[14px] border-black/10 px-[35px] pt-[90px] pb-[35px] mt-6 mb-8'>

            {/* スコア（large）: 中央上部に突き出し */}
            {post.score !== undefined && (
              <div className='absolute left-1/2 top-5 -translate-x-1/2 -translate-y-1/2'>
                <ScoreWithRank value={post.score} />
              </div>
            )}

            {/* 抜粋 */}
            {post.excerpt && (
              <p className='text-[length:var(--font-size-body-sp)] leading-[1.7] text-[var(--color-text-secondary)] mb-6'>
                {post.excerpt}
              </p>
            )}

            {/* 基本情報 */}
            {(post.basicInfo || (post.credits && post.credits.length > 0)) && (
              <BasicInfo {...post.basicInfo} credits={post.credits} locale={locale} />
            )}

            {/* キャスト情報 */}
            {post.actors && post.actors.length > 0 && (
              <ActorsInfo actors={post.actors} locale={locale} />
            )}

            {/* 動画埋め込み */}
            {post.videoCode && (
              <VideoEmbed embedCode={post.videoCode} />
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
          officialSnsUrl={post.basicInfo?.officialSns?.x?.link}
          officialYoutubeUrl={post.basicInfo?.officialSns?.youtube_channel?.link}
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
