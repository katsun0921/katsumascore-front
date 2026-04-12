import { getRankingIcon, getRankScoreTextColorClass } from './getRankingIcon'

/** value/max 表記用: 整数部（大）と小数＋/max（小）に分割 */
function formatScoreValueMaxParts(
  value: number,
  max: number,
): { main: string; sub: string } {
  const vStr = Number.isInteger(value) ? String(value) : value.toFixed(1)
  const dot = vStr.indexOf('.')
  if (dot === -1) {
    return { main: vStr, sub: `/${max}` }
  }
  return { main: vStr.slice(0, dot), sub: `${vStr.slice(dot)}/${max}` }
}

export type ScoreWithRankProps = {
  value: number
  max: number
}

function ScoreWithRankInner({ value, max }: ScoreWithRankProps) {
  const rank = getRankingIcon(value)
  const { main, sub } = formatScoreValueMaxParts(value, max)
  const textColorClass = getRankScoreTextColorClass(rank?.label ?? null)

  return (
    <div className='relative'>
      {rank ? (
        <div className='absolute right-0 top-1/2 z-[1] -translate-y-1/2'>
          <img
            src={rank.src}
            alt={`rank ${rank.label}`}
            width={96}
            height={96}
            className='h-[var(--size-score-rank-badge-sp)] w-[var(--size-score-rank-badge-sp)] md:h-[var(--size-score-rank-badge-pc)] md:w-[var(--size-score-rank-badge-pc)]'
          />
        </div>
      ) : null}
      <div
        className={`relative z-[2] translate-y-[var(--offset-score-hero-text-y)] [text-shadow:var(--shadow-score-hero-text)] font-[family-name:var(--font-accent-strong)] font-bold leading-none tracking-[var(--letter-spacing-score-hero)] text-[length:var(--font-size-score-hero-int-sp)] md:text-[length:var(--font-size-score-hero-int-pc)] ${textColorClass}`}
      >
        <span>{main}</span>
        <span className='ml-[var(--space-4)] text-[length:var(--font-size-score-hero-decimal-sp)] md:text-[length:var(--font-size-score-hero-decimal-pc)]'>
          {sub}
        </span>
      </div>
    </div>
  )
}

export const ScoreWithRank = (props: ScoreWithRankProps) => {
  return (
    <div
      className='notranslate inline-flex min-w-0 flex-col items-stretch [isolation:isolate]'
      data-score-with-rank-root
    >
      <ScoreWithRankInner {...props} />
    </div>
  )
}
