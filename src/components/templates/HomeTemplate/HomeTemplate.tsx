import { HomeHero } from '@/components/features/HomeHero';
import { AdBanner } from '@/components/ui-section/AdBanner';
import { HomeRanking } from '@/components/ui-home/HomeRanking';
import { HomeCardScrollList } from '@/components/ui-home/HomeCardScrollList';
import { HomeVodFinder } from '@/components/ui-home/HomeVodFinder';
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
 *   Hero → 広告バナー（ja） → VOD バッジ凡例 → Ranking → 最新レビュー → 注目のアニメ → 高評価 → Recommend
 *   → 特集 → VOD
 */
export const HomeTemplate = ({
  hero,
  rankingPosts,
  latestPosts,
  latestSeeAllHref,
  animeArchiveHref,
  animePosts,
  highScorePosts,
  recommendBlocks,
  vodFinderItems,
  featuredItems,
}: HomeTemplateProps) => {
  const locale = useLocale();

  return (
    <PageLayout>
    <div className='homeTemplate max-w-full min-w-0 overflow-x-hidden'>
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

        <section className='homeTemplate__section'>
          <HomeRanking
            title={t(messages, ['ranking', 'title'], locale)}
            posts={rankingPosts}
            seeAllHref='/ranking'
          />
        </section>

        <section className='homeTemplate__section'>
          <HomeCardScrollList
            title={t(messages, ['cardScrollList', 'latest'], locale)}
            posts={latestPosts}
            seeAllHref={latestSeeAllHref}
          />
        </section>

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
