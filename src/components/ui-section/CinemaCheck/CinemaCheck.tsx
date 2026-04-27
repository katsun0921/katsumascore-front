import type { CinemaCheckProps } from './CinemaCheck.types';

export const CinemaCheck = ({ badgeLabel, message }: CinemaCheckProps) => (
  <div className='mt-[var(--space-16)] flex items-center gap-[var(--space-12)] rounded-[6px] border-l-[4px] border-l-[var(--color-category)] bg-[var(--color-bg-muted)] px-[var(--space-16)] py-[var(--space-12)]'>
    <span className='inline-block whitespace-nowrap rounded-[4px] bg-[var(--color-category)] px-[var(--space-12)] py-[var(--space-4)] text-[length:var(--font-size-caption-lg)] font-[var(--font-weight-bold)] text-[var(--color-text-inverse)]'>
      {badgeLabel}
    </span>
    <p className='m-0 text-[length:var(--font-size-ui-lg)] text-[var(--color-text-primary)]'>{message}</p>
  </div>
);
