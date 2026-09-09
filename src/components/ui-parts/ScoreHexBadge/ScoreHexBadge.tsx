import type { ScoreHexBadgeProps } from './ScoreHexBadge.types';

const HIGH_SCORE_THRESHOLD = 3.5;

export const ScoreHexBadge = ({ score, className }: ScoreHexBadgeProps) => {
  const color =
    score >= HIGH_SCORE_THRESHOLD
      ? 'var(--color-score-accent)'
      : 'var(--color-score-rank-high)';
  return (
    <svg
      data-component='ScoreHexBadge'
      width='48'
      height='52'
      viewBox='0 0 48 52'
      aria-label={`スコア ${score}`}
      className={className}
    >
      <polygon
        points='24,2 46,14 46,38 24,50 2,38 2,14'
        fill='rgba(20,8,46,0.8)'
        stroke={color}
        strokeWidth='2'
      />
      <text
        x='24'
        y='31'
        textAnchor='middle'
        fill={color}
        fontSize='14'
        fontWeight='700'
        fontFamily='var(--font-ui)'
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
};
