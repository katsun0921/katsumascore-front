// ISR: revalidate 60s — WordPress 旧スラッグの季節レビュー一覧
import type { GetStaticProps } from 'next';
import SeasonalIndexPage, {
  buildSeasonalIndexProps,
  WORDPRESS_SEASONAL_REVIEWS_BASE_PATH,
} from '../seasonal-reviews';

export default SeasonalIndexPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: await buildSeasonalIndexProps(locale, WORDPRESS_SEASONAL_REVIEWS_BASE_PATH),
    revalidate: 600,
  };
};
