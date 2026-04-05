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
import { RelationPost } from '@/components/features/ArticleBlock/RelationPost/RelationPost'
import { StreamingVod } from '@/components/features/ArticleBlock/StreamingVod/StreamingVod'
import { AdRental } from '@/components/features/ArticleBlock/AdRental/AdRental'
import { PostsGroup } from '@/components/features/PostsGroup/PostsGroup'
import { ShareButtons } from '@/components/features/ShareButtons/ShareButtons'
import type { PostDetailProps } from './PostDetail.types'
import './PostDetail.scss'

export const PostDetail = ({ post, locale = 'ja' }: PostDetailProps) => {
  const categories = post.category
    ? [{ label: post.category, href: `/category/${post.category}` }]
    : []

  return (
    <div className='p-postDetail'>

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

      <div className='p-postDetail__body'>
        <div className='p-postDetail__main'>

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
          <section className='p-postDetail__info'>

            {/* スコア（large） */}
            {post.score !== undefined && (
              <div className='p-postDetail__score'>
                <ScoreWithRank value={post.score} />
              </div>
            )}

            {/* 抜粋 */}
            {post.excerpt && (
              <p className='p-postDetail__excerpt'>{post.excerpt}</p>
            )}

            {/* 基本情報（原題・公式サイト・上映日・制作会社・配給会社・スタッフ） */}
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
          <article className='p-postDetail__content'>
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

        {/* ── aside ブロック群 ── */}
        <aside className='p-postDetail__aside'>

          {/* acf-relation-by-post-id.php 相当 */}
          {post.relationPosts && post.relationPosts.length > 0 && (
            <RelationPost posts={post.relationPosts} locale={locale} />
          )}

          {/* acf-streaming-vod.php 相当（劇場公開中は非表示） */}
          {!post.isCinemaShowing && post.streamingVods && post.streamingVods.length > 0 && (
            <StreamingVod
              titleJp={post.title}
              titleEn={post.titleEn}
              services={post.streamingVods}
              locale={locale}
            />
          )}

          {/* ad-rental.php 相当（劇場公開中・英語は非表示） */}
          {!post.isCinemaShowing && locale !== 'en' && post.rentalServices && post.rentalServices.length > 0 && (
            <AdRental
              titleJp={post.title}
              services={post.rentalServices}
              locale={locale}
            />
          )}

          {/* RelatedPostGroups / SeriesPosts / CategoryPosts / TagPosts 相当 */}
          {post.postsGroups && post.postsGroups.length > 0 && (
            <PostsGroup groups={post.postsGroups} />
          )}
        </aside>
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
