import './ScoreWithRank.scss'
import { Score } from './Score'
import { getRankingIcon } from './getRankingIcon'

export type ScoreWithRankProps = {
  value: number
  max?: number
}

export const ScoreWithRank = ({ value, max }: ScoreWithRankProps) => {
  const rank = getRankingIcon(value)

  return (
    <div className='score-with-rank'>
      <Score value={value} max={max} />
      {rank != null && (
        <img
          className='score-with-rank__icon'
          src={rank.src}
          alt={`rank ${rank.label}`}
          width={40}
          height={40}
        />
      )}
    </div>
  )
}
