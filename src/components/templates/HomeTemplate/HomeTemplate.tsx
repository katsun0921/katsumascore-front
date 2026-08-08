import { HomeHero } from '@/components/features/HomeHero';
import { HomeShorts } from '@/components/features/HomeShorts';
import { AdBanner } from '@/components/ui-section/AdBanner';
import { HomeRanking } from '@/components/ui-home/HomeRanking';
import { HomeCardScrollList } from '@/components/ui-home/HomeCardScrollList';
import { HomeVodFinder } from '@/components/ui-home/HomeVodFinder';
import { HomeReleaseHighlight } from '@/components/ui-home/HomeReleaseHighlight';
import { HomeRecommend } from '@/components/ui-home/HomeRecommend';
import { VodLegend } from '@/components/ui-section/VodLegend';
import { HomeFeatured } from '@/components/ui-home/HomeFeatured';
import { PageLayout } from '@/components/templates/PageLayout';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { HomeTemplateProps } from './HomeTemplate.types';
/**
 * DOM順はSPファースト。body（.homeTemplate__body）は SP / PC とも 1 列の縦積み。
 *
 * 表示順:
 *   Hero → 広告バナー（ja） → VOD バッジ凡例 → 劇場公開/VOD配信 最新情報 → Ranking → 最新レビュー
 *   → ショート動画 → 注目のアニメ → 高評価 → Recommend → 特集 → VOD
 */
export const HomeTemplate = ({
  hero,
  rankingPosts,
  latestPosts,
  latestSeeAllHref,
  animeArchiveHref,
  animePosts,
  highScorePosts,
  shortVideoPosts,
  recommendBlocks,
  vodFinderItems,
  featuredItems,
  theaterReleaseHighlight,
  vodReleaseHighlight,
}: HomeTemplateProps) => {
  const locale = useLocale();

  return (
    <PageLayout>
    <div data-component='HomeTemplate' className='homeTemplate max-w-full min-w-0 overflow-x-hidden'>
      <HomeHero {...hero} />

      {locale === 'ja' && (
        <div className='relative z-10 w-full px-4 pt-10 pb-6 md:px-8'>
          <AdBanner inline />
        </div>
      )}

      <div className='homeTemplate__body max-w-full min-w-0'>
        <section className='homeTemplate__section'>
          <VodLegend services={vodFinderItems.map((item) => item.vod)} badgeColor='light' />
        </section>

        {(theaterReleaseHighlight || vodReleaseHighlight) && (
          <section className='homeTemplate__section'>
            <HomeReleaseHighlight
              theaterTitle={t(messages, ['releaseHighlight', 'theaterTitle'], locale)}
              vodTitle={t(messages, ['releaseHighlight', 'vodTitle'], locale)}
              seeAllLabel={t(messages, ['releaseHighlight', 'seeAll'], locale)}
              theater={theaterReleaseHighlight}
              vod={vodReleaseHighlight}
            />
          </section>
        )}

        <section className='homeTemplate__section'>
          <HomeRanking
            title={t(messages, ['ranking', 'title'], locale)}
            posts={rankingPosts}
          />
        </section>

        <section className='homeTemplate__section'>
          <HomeCardScrollList
            title={t(messages, ['cardScrollList', 'latest'], locale)}
            posts={latestPosts}
            seeAllHref={latestSeeAllHref}
          />
        </section>

        {shortVideoPosts.length > 0 && (
          <section className='homeTemplate__section'>
            <HomeShorts
              title={t(messages, ['shorts', 'title'], locale)}
              posts={shortVideoPosts}
            />
          </section>
        )}

        <section className='homeTemplate__section'>
          <HomeCardScrollList
            title={t(messages, ['cardScrollList', 'anime'], locale)}
            posts={animePosts}
            seeAllHref={animeArchiveHref}
          />
        </section>

        <section className='homeTemplate__section'>
          <HomeCardScrollList
            title={t(messages, ['cardScrollList', 'highScore'], locale)}
            posts={highScorePosts}
            icon='star'
          />
        </section>

        <section className='homeTemplate__section'>
          <HomeRecommend
            title={t(messages, ['recommend', 'title'], locale)}
            seeAllLabel={t(messages, ['recommend', 'seeAll'], locale)}
            blocks={recommendBlocks}
          />
        </section>

        <section className='homeTemplate__section'>
          <HomeFeatured title={t(messages, ['featured', 'title'], locale)} items={featuredItems} />
        </section>

        <section className='homeTemplate__section'>
          <HomeVodFinder
            title={t(messages, ['vodFinder', 'title'], locale)}
            workCountSuffix={t(messages, ['vodFinder', 'workCountSuffix'], locale)}
            items={vodFinderItems}
          />
        </section>
      </div>
    </div>
    </PageLayout>
  );
};
