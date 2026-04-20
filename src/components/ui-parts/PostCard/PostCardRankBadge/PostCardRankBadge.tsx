type Props = {
  rank: number;
};

export const PostCardRankBadge = ({ rank }: Props) => (
  <span className='absolute top-2 left-2 z-[1] inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-score-border)] text-[var(--color-secondary)] font-bold text-[var(--font-size-caption)]'>
    {rank}
  </span>
);
