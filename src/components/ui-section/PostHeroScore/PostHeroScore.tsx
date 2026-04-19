import { ScoreWithRank } from '@/components/features/ScoreWithRank'
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay'

export type PostHeroScoreProps = {
  score: number
  scoreMax?: number
  comment: string
}

export const PostHeroScore = ({ score, scoreMax = SCORE_DISPLAY_MAX, comment }: PostHeroScoreProps) => {
  return (
    <section className='flex gap-3 font-[var(--font-accent-strong)]'>
      <p className='text-[length:var(--font-size-h2)] font-bold text-[var(--color-text-primary)] tracking-[0.03em] [text-shadow:-1px_1px_2px_rgba(var(--color-black-rgb),0.2)] pl-3 m-0'>
        {comment}
      </p>
      <div className='flex'>
        <ScoreWithRank value={score} max={scoreMax} />
      </div>
    </section>
  )
}
