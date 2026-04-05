import { getRankingIcon } from './getRankingIcon'

export type ScoreWithRankProps = {
  value: number
}

export const ScoreWithRank = ({ value }: ScoreWithRankProps) => {
  const rank = getRankingIcon(value)
  if (!rank) return null

  return (
    <img
      src={rank.src}
      alt={`rank ${rank.label}`}
      width={40}
      height={40}
    />
  )
}
