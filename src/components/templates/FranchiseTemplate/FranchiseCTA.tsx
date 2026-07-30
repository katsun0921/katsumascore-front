import Link from 'next/link';
import type { FranchiseRelatedLink } from '@/types/franchise';
import styles from './FranchiseCTA.module.scss';

type FranchiseCTAProps = {
  relatedLinks: FranchiseRelatedLink[];
  watchLabel: string;
  reviewLabel: string;
  streamLabel: string;
  relatedLinksHeading: string;
};

export const FranchiseCTA = ({
  relatedLinks,
  watchLabel,
  reviewLabel,
  streamLabel,
  relatedLinksHeading,
}: FranchiseCTAProps) => (
  <section data-component='FranchiseCTA' className={styles.franchiseCta}>
    <div className={styles.franchiseCta__buttons}>
      <a href='#franchise-posts' className={styles.franchiseCta__btn}>{watchLabel}</a>
      <a href='#franchise-posts' className={styles.franchiseCta__btn}>{reviewLabel}</a>
      <a href='#franchise-posts' className={styles.franchiseCta__btn}>{streamLabel}</a>
    </div>

    {relatedLinks.length > 0 && (
      <div className={styles.franchiseCta__links}>
        <p className={styles.franchiseCta__linksHeading}>{relatedLinksHeading}</p>
        <ul className={styles.franchiseCta__linkList}>
          {relatedLinks.map((link, i) => (
            <li key={i}>
              <Link
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.franchiseCta__link}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
);
