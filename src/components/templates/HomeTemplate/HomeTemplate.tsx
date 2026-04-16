import { HomeHero } from '@/components/features/home/HomeHero/HomeHero';
import { HomeRanking } from '@/components/features/home/HomeRanking/HomeRanking';
import { HomeCardScroll } from '@/components/features/home/HomeCardScroll/HomeCardScroll';
import { HomeVodFinder } from '@/components/features/home/HomeVodFinder/HomeVodFinder';
import { HomeSeasonReview } from '@/components/features/home/HomeSeasonReview/HomeSeasonReview';
import { HomeRecommend } from '@/components/features/home/HomeRecommend/HomeRecommend';
import { HomeFeatured } from '@/components/features/home/HomeFeatured/HomeFeatured';
import type { HomeTemplateProps } from './HomeTemplate.types';
import './HomeTemplate.scss';

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
  animePosts,
  highScorePosts,
  recommendBlocks,
  vodFinderItems,
  seasonItems,
  featuredItems,
}: HomeTemplateProps) => {
  return (
    <div className='homeTemplate'>
      <HomeHero {...hero} />

      <div className='homeTemplate__body'>
        {/* ── SP: 1列目 / PC: 左列 ── */}
        <section className='homeTemplate__section'>
          <HomeRanking posts={rankingPosts} seeAllHref='/ranking' />
        </section>

        <section className='homeTemplate__section'>
          <HomeCardScroll title='最新レビュー' posts={latestPosts} seeAllHref='/posts' />
        </section>

        {/* ── SP: 3列目 / PC: 右列1段目（sidebar） ── */}
        <section className='homeTemplate__section homeTemplate__section--sidebar'>
          <HomeCardScroll title='注目のアニメ' posts={animePosts} seeAllHref='/anime' />
        </section>

        {/* ── SP: 4列目 / PC: 左列続き ── */}
        <section className='homeTemplate__section'>
          <HomeCardScroll title='高評価作品' posts={highScorePosts} icon='star' />
        </section>

        <section className='homeTemplate__section'>
          <HomeRecommend blocks={recommendBlocks} />
        </section>

        <section className='homeTemplate__section'>
          <HomeFeatured items={featuredItems} />
        </section>

        <section className='homeTemplate__section'>
          <HomeVodFinder items={vodFinderItems} />
        </section>

        {/* ── SP: 末尾 / PC: 右列2段目（sidebar） ── */}
        <section className='homeTemplate__section homeTemplate__section--sidebar'>
          <HomeSeasonReview seasons={seasonItems} />
        </section>
      </div>
    </div>
  );
};
