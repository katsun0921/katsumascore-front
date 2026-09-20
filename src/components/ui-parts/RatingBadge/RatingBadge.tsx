import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { TRating } from '@/libs/rating';

export type TRatingBadgeProps = {
  rating: TRating
  /** 区分の意味（`12歳未満は保護者の助言・指導が必要` 等）をバッジの右に併記する */
  withNote?: boolean
}

export const RatingBadge = ({ rating, withNote = false }: TRatingBadgeProps) => {
  const locale = useLocale();
  const code = t(messages, ['code', rating], locale);
  const note = t(messages, ['note', rating], locale);
  const label = `${t(messages, ['label', 'rating'], locale)}: ${code}（${note}）`;

  return (
    <span data-component='RatingBadge' className='inline-flex items-center gap-2' aria-label={label}>
      <span
        title={note}
        className='inline-block rounded-[3px] border border-color-border-muted px-2 py-1 text-[var(--font-size-caption-lg)] font-bold leading-[1.2] text-color-primary'
      >
        {code}
      </span>
      {withNote && <span className='text-[var(--font-size-caption-sm)] text-color-secondary'>{note}</span>}
    </span>
  );
};
