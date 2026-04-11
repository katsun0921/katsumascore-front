import { ScoreWithRank } from '@/components/ui/Score/ScoreWithRank'
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay'
import './PostHeroScore.scss'

export type PostHeroScoreProps = {
  score: number
  scoreMax?: number
  comment: string
}

export function PostHeroScore({ score, scoreMax = SCORE_DISPLAY_MAX, comment }: PostHeroScoreProps) {
  return (
    <div className='post-hero-score'>
      <div className='post-hero-score__value'>
        <ScoreWithRank value={score} max={scoreMax} />
      </div>
      <p className='post-hero-score__comment'>{comment}</p>
    </div>
  )
}
