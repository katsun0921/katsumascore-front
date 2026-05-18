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
  <section className={styles.franchiseCta}>
    <div className={styles.franchiseCta__buttons}>
      <span className={styles.franchiseCta__btn}>{watchLabel}</span>
      <span className={styles.franchiseCta__btn}>{reviewLabel}</span>
      <span className={styles.franchiseCta__btn}>{streamLabel}</span>
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
