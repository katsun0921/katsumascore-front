import { HomeHero } from '@/components/features/HomeHero';
import { AdBanner } from '@/components/ui-section/AdBanner';
import { HomeRanking } from '@/components/ui-home/HomeRanking';
import { HomeCardScrollList } from '@/components/ui-home/HomeCardScrollList';
import { HomeVodFinder } from '@/components/ui-home/HomeVodFinder';
import { HomeRecommend } from '@/components/ui-home/HomeRecommend';
import { HomeFeatured } from '@/components/ui-home/HomeFeatured';
import { HomeFacebook } from '@/components/ui-home/HomeFacebook';
import { HomePageEmbeds } from '@/components/features/HomePageEmbeds';
import { PageLayout } from '@/components/templates/PageLayout';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { HomeTemplateProps } from './HomeTemplate.types';
/**
 * DOM順はSPファースト。body（.homeTemplate__body）は SP / PC とも 1 列の縦積み。
 * 2 列レイアウトは .homeTemplate__section--featuredFacebookRow 内のみ（特集 2 : Facebook 1、md 以上）。
 *
 * 表示順:
 *   Hero → 広告バナー（ja） → Ranking → 最新レビュー → 注目のアニメ → 高評価 → Recommend
 *   → 特集＋Facebook（md 以上は横並び）→ VOD
 */
export const HomeTemplate = ({
  hero,
  rankingPosts,
  latestPosts,
  animeArchiveHref,
  animePosts,
  highScorePosts,
  recommendBlocks,
  vodFinderItems,
  featuredItems,
  facebookTimelineEmbedUrl,
  homeAdScriptSrcs,
}: HomeTemplateProps) => {
  const locale = useLocale();

  return (
    <PageLayout>
    <div className='homeTemplate max-w-full min-w-0 overflow-x-hidden'>
      <HomeHero {...hero} />

      {locale === 'ja' && (
        <div className='w-full px-4 pt-10 pb-6 md:px-8'>
          <AdBanner inline />
        </div>
      )}

      <div className='homeTemplate__body max-w-full min-w-0'>
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
            seeAllHref='/posts'
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

        <section className='homeTemplate__section homeTemplate__section--featuredFacebookRow min-w-0 max-w-full'>
          <div className='flex w-full min-w-0 max-w-full flex-col gap-10 md:grid md:grid-cols-3 md:items-start md:gap-10'>
            <div className='min-w-0 max-w-full overflow-x-hidden md:col-span-2'>
              <HomeFeatured title={t(messages, ['featured', 'title'], locale)} items={featuredItems} />
            </div>
            <div className='min-w-0 max-w-full overflow-x-hidden md:col-span-1'>
              <HomeFacebook
                title={t(messages, ['facebook', 'title'], locale)}
                embedUrl={facebookTimelineEmbedUrl}
              />
            </div>
          </div>
        </section>

        <section className='homeTemplate__section'>
          <HomeVodFinder
            title={t(messages, ['vodFinder', 'title'], locale)}
            workCountSuffix={t(messages, ['vodFinder', 'workCountSuffix'], locale)}
            items={vodFinderItems}
          />
        </section>
      </div>
      <HomePageEmbeds extraScriptSrcs={homeAdScriptSrcs} />
    </div>
    </PageLayout>
  );
};
