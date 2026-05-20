import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import { FranchiseHero } from './FranchiseHero';
import { FranchiseHighlights } from './FranchiseHighlights';
import { FranchiseTimeline } from './FranchiseTimeline';
import { FranchisePostList } from './FranchisePostList';
import { FranchiseCTA } from './FranchiseCTA';
import styles from './FranchiseTemplate.module.scss';
import type { Franchise } from '@/types/franchise';

type FranchiseTemplateProps = {
  franchise: Franchise;
  breadcrumbs: { label: string; href: string }[];
};

export const FranchiseTemplate = ({ franchise, breadcrumbs }: FranchiseTemplateProps) => {
  const locale = useLocale();

  return (
    <PageLayout>
      <FranchiseHero
        title={franchise.title}
        catchCopy={franchise.catchCopy}
        heroImage={franchise.heroImage}
      />

      <div className={styles.franchiseTemplate__inner}>
        <Breadcrumb items={breadcrumbs} />

        {(franchise.startYear || franchise.originalAuthor || franchise.productionCompany) && (
          <ul className={styles.franchiseTemplate__meta}>
            {franchise.startYear && (
              <li>
                {t(messages, ['meta', 'startYear'], locale)}: {franchise.startYear}
                {franchise.endYear ? `–${franchise.endYear}` : '–'}
              </li>
            )}
            {franchise.originalAuthor && (
              <li>
                {t(messages, ['meta', 'originalAuthor'], locale)}: {franchise.originalAuthor}
              </li>
            )}
            {franchise.productionCompany && (
              <li>
                {t(messages, ['meta', 'productionCompany'], locale)}: {franchise.productionCompany}
              </li>
            )}
          </ul>
        )}

        {franchise.description && (
          <section className={styles.franchiseTemplate__overview}>
            <h2 className={styles.franchiseTemplate__sectionHeading}>
              {t(messages, ['section', 'overview'], locale)}
            </h2>
            <p className={styles.franchiseTemplate__overviewText}>{franchise.description}</p>
          </section>
        )}

        <FranchiseHighlights
          highlights={franchise.highlights}
          heading={t(messages, ['section', 'highlights'], locale)}
        />

        {franchise.showTimeline && (
          <FranchiseTimeline
            timeline={franchise.timeline}
            heading={t(messages, ['section', 'timeline'], locale)}
          />
        )}

        <div id='franchise-posts'>
          <FranchisePostList
            posts={franchise.posts}
            heading={t(messages, ['section', 'posts'], locale)}
            showScore={franchise.showScore}
            scoreHeading={t(messages, ['section', 'scoreRanking'], locale)}
            typeLabels={{
              movie: t(messages, ['postType', 'movie'], locale),
              anime: t(messages, ['postType', 'anime'], locale),
              drama: t(messages, ['postType', 'drama'], locale),
            }}
          />
        </div>

        <FranchiseCTA
          relatedLinks={franchise.relatedLinks}
          watchLabel={t(messages, ['cta', 'watch'], locale)}
          reviewLabel={t(messages, ['cta', 'review'], locale)}
          streamLabel={t(messages, ['cta', 'stream'], locale)}
          relatedLinksHeading={t(messages, ['section', 'relatedLinks'], locale)}
        />
      </div>
    </PageLayout>
  );
};
