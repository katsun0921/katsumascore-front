import type { CinemaCheckProps } from './CinemaCheck.types';

export const CinemaCheck = ({ badgeLabel, message }: CinemaCheckProps) => (
  <div data-component='CinemaCheck' className='mt-4 flex items-center gap-3 rounded-[6px] border-l-[4px] border-l-category bg-color-bg-muted px-4 py-3'>
    <span className='inline-block whitespace-nowrap rounded-[4px] bg-category px-3 py-1 text-[var(--font-size-caption-lg)] font-[var(--font-weight-bold)] text-color-inverse'>
      {badgeLabel}
    </span>
    <p className='m-0 text-ui text-color-primary'>{message}</p>
  </div>
);
