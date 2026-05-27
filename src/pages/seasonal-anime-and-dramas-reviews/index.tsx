// ISR: revalidate REVALIDATE_NORMAL — WordPress 旧スラッグの季節レビュー一覧
import type { GetStaticProps } from 'next';
import { REVALIDATE_NORMAL } from '@/config/revalidate.config';
import SeasonalIndexPage, {
  buildSeasonalIndexProps,
  WORDPRESS_SEASONAL_REVIEWS_BASE_PATH,
} from '../seasonal-reviews';

export default SeasonalIndexPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: await buildSeasonalIndexProps(locale, WORDPRESS_SEASONAL_REVIEWS_BASE_PATH),
    revalidate: REVALIDATE_NORMAL,
  };
};
