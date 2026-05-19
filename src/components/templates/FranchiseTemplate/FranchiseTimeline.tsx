import type { FranchiseTimelineEntry } from '@/types/franchise';
import styles from './FranchiseTimeline.module.scss';

type FranchiseTimelineProps = {
  timeline: FranchiseTimelineEntry[];
  heading: string;
};

export const FranchiseTimeline = ({ timeline, heading }: FranchiseTimelineProps) => {
  if (timeline.length === 0) return null;
  return (
    <section className={styles.franchiseTimeline}>
      <h2 className={styles.franchiseTimeline__heading}>{heading}</h2>
      <ol className={styles.franchiseTimeline__list}>
        {timeline.map((entry, i) => (
          <li key={i} className={styles.franchiseTimeline__item}>
            <span className={styles.franchiseTimeline__year}>{entry.year}</span>
            <span className={styles.franchiseTimeline__content}>{entry.content}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};
