import { HomeHero } from '@/components/features/HomeHero';
import { HomeRanking } from '@/components/ui-home/HomeRanking';
import { HomeCardScrollList } from '@/components/ui-home/HomeCardScrollList';
import { HomeVodFinder } from '@/components/ui-home/HomeVodFinder';
import { HomeRecommend } from '@/components/ui-home/HomeRecommend';
import { HomeFeatured } from '@/components/ui-home/HomeFeatured';
import { HomeSeasonReview } from '@/components/ui-home/HomeSeasonReview';
import { HomePageEmbeds } from '@/components/features/HomePageEmbeds';
import { PageLayout } from '@/components/templates/PageLayout';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { HomeTemplateProps } from './HomeTemplate.types';
/**
 * DOM順はSPファースト。
 * PCでは CSS grid の grid-column / grid-row でサイドバー列（右）に再配置する。
 *
 * SP表示順:
 *   Hero → Ranking → 最新レビュー → 注目のアニメ → 高評価 → Recommend → Featured → VOD → Season
 *
 * PC表示:
 *   左列（main）: Ranking → 最新レビュー → 高評価 → Recommend → Featured → VOD
 *   右列（sidebar）: 注目のアニメ → Season
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
  seasonItems,
  featuredItems,
  facebookTimelineEmbedUrl,
  homeAdScriptSrcs,
}: HomeTemplateProps) => {
  const locale = useLocale();

  return (
    <PageLayout>
    <div className='homeTemplate'>
      <HomeHero {...hero} />

      <div className='homeTemplate__body'>
        {/* ── SP: 1列目 / PC: 左列 ── */}
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

        <section className='homeTemplate__section homeTemplate__section--sidebar'>
          <HomeCardScrollList
            title={t(messages, ['cardScrollList', 'anime'], locale)}
            posts={animePosts}
            seeAllHref={animeArchiveHref}
          />
        </section>

        {/* ── SP: 4列目 / PC: 左列続き ── */}
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

        <section className='homeTemplate__section homeTemplate__section--sidebar'>
          <HomeSeasonReview
            title={t(messages, ['seasonReview', 'title'], locale)}
            items={seasonItems}
          />
        </section>
      </div>
      <HomePageEmbeds
        facebookTimelineEmbedUrl={facebookTimelineEmbedUrl}
        extraScriptSrcs={homeAdScriptSrcs}
      />
    </div>
    </PageLayout>
  );
};
