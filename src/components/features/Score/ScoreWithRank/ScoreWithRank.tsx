import './ScoreWithRank.scss'
import { getRankingIcon } from './getRankingIcon'
import type { RankLabel } from './getRankingIcon'

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

function getRankModifier(rank: RankLabel | null): string {
  if (!rank) return 'rank-none'
  return `rank-${rank.toLowerCase()}`
}

export type ScoreWithRankProps = {
  value: number
  max: number
  imageOnly?: boolean
}

function ScoreWithRankInner({ value, max, imageOnly = false }: ScoreWithRankProps) {
  const rank = getRankingIcon(value)
  const { main, sub } = formatScoreValueMaxParts(value, max)
  const modifier = getRankModifier(rank?.label ?? null)

  if (imageOnly) {
    return rank ? (
      <img
        src={rank.src}
        alt={`rank ${rank.label}`}
        width={96}
        height={96}
        className='score-with-rank__badge-img--standalone'
      />
    ) : null
  }

  return (
    <div className='score-with-rank__inner'>
      {rank ? (
        <div className='score-with-rank__badge'>
          <img
            src={rank.src}
            alt={`rank ${rank.label}`}
            width={96}
            height={96}
            className='score-with-rank__badge-img'
          />
        </div>
      ) : null}
      <div className={`score-with-rank__text score-with-rank__text--${modifier}`}>
        <span className='score-with-rank__value-wrap'>
          <span className={`score-with-rank__slash score-with-rank__slash--${modifier}`}></span>
          <span className='score-with-rank__value-inner'>
            {main}
            <span className='score-with-rank__decimal'>
              {sub}
            </span>
          </span>
        </span>
      </div>
    </div>
  )
}

export const ScoreWithRank = (props: ScoreWithRankProps) => {
  return (
    <div
      className='score-with-rank notranslate'
      data-score-with-rank-root
    >
      <ScoreWithRankInner {...props} />
    </div>
  )
}
