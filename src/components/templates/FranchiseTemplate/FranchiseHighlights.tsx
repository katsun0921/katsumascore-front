import type { FranchiseHighlight } from '@/types/franchise';
import styles from './FranchiseHighlights.module.scss';

type FranchiseHighlightsProps = {
  highlights: FranchiseHighlight[];
  heading: string;
};

export const FranchiseHighlights = ({ highlights, heading }: FranchiseHighlightsProps) => {
  if (highlights.length === 0) return null;
  return (
    <section data-component='FranchiseHighlights' className={styles.franchiseHighlights}>
      <h2 className={styles.franchiseHighlights__heading}>{heading}</h2>
      <ul className={styles.franchiseHighlights__list}>
        {highlights.map((h, i) => (
          <li key={i} className={styles.franchiseHighlights__item}>
            <p className={styles.franchiseHighlights__title}>{h.title}</p>
            <p className={styles.franchiseHighlights__desc}>{h.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};
