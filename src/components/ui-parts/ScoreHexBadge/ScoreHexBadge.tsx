import type { ScoreHexBadgeProps } from './ScoreHexBadge.types';

const HIGH_SCORE_THRESHOLD = 3.5;

export const ScoreHexBadge = ({ score, className }: ScoreHexBadgeProps) => {
  const color =
    score >= HIGH_SCORE_THRESHOLD
      ? 'var(--color-score-border)'
      : 'var(--color-score-rank-s-text)';
  return (
    <svg
      width='24'
      height='26'
      viewBox='0 0 24 26'
      aria-label={`スコア ${score}`}
      className={className}
    >
      <polygon
        points='12,1 23,7 23,19 12,25 1,19 1,7'
        fill='rgba(20,8,46,0.8)'
        stroke={color}
        strokeWidth='1'
      />
      <text
        x='12'
        y='16'
        textAnchor='middle'
        fill={color}
        fontSize='7'
        fontWeight='700'
        fontFamily='var(--font-ui)'
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
};
