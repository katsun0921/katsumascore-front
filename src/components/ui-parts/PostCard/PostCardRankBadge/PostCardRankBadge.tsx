type Props = {
  rank: number;
};

export const PostCardRankBadge = ({ rank }: Props) => (
  <span data-component='PostCardRankBadge' className='absolute top-2 left-2 z-[1] inline-flex items-center justify-center w-6 h-6 rounded-full bg-score-accent text-secondary font-bold text-caption'>
    {rank}
  </span>
);
