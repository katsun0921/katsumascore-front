import { ScoreWithRank } from '@/components/features/Score/ScoreWithRank/ScoreWithRank'
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import type { TStudioEntry } from '@/components/features/Post/PostTitleMeta/PostTitleMeta'
import './PostHeader.scss'

export type PostHeaderProps = {
  category: string
  titleJa: string
  titleEn?: string
  filmStudios?: TStudioEntry[]
  productionStudios?: TStudioEntry[]
  releaseDate?: string  // 'YYYYMMDD'
  rating?: string
  copyright?: string
  // PostHeroScore から移動
  score?: number
  scoreMax?: number
  comment?: string
}

export function PostHeader({
  category,
  titleJa,
  titleEn,
  filmStudios,
  productionStudios,
  releaseDate,
  rating,
  copyright,
  score,
  scoreMax = SCORE_DISPLAY_MAX,
  comment,
}: PostHeaderProps) {
  const locale = useLocale()
  const sep = t(messages, ['meta', 'sep'], locale)

  const year = releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : undefined
  const distributors = filmStudios?.map((s) => s.name).join(' / ')
  const productions = productionStudios?.map((s) => s.name).join(' / ')

  const metaParts = [distributors, productions, year, rating].filter(Boolean)

  return (
    <div className='post-header'>
      {comment && <p className='post-header__comment'>{comment}</p>}
      <h1 className='post-header__title-main'>{titleJa}</h1>
      <div className='post-header__lower'>
        <div className='post-header__meta-group'>
          {titleEn && <p className='post-header__title-sub'>{titleEn}</p>}
          {metaParts.length > 0 && (
            <p className='post-header__meta'>
              {metaParts.map((part, i) => (
                <span key={i}>
                  {i > 0 && <span className='post-header__meta-sep'>{sep}</span>}
                  {part}
                </span>
              ))}
            </p>
          )}
          {copyright && <p className='post-header__copyright'>{copyright}</p>}
        </div>
        {score !== undefined && (
          <div className='post-header__rank'>
            <ScoreWithRank value={score} max={scoreMax} />
          </div>
        )}
      </div>
    </div>
  )
}
