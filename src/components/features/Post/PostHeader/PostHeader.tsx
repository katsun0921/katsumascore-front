import { ScoreWithRank } from '@/components/features/ScoreWithRank/ScoreWithRank'
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import type { TStudioEntry } from '@/components/features/Post/PostTitleMeta/PostTitleMeta'
import './PostHeader.scss'

export type PostHeaderProps = {
  category: string
  titleOfficial: string
  titleOriginal?: string
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

export const PostHeader = ({
  titleOfficial,
  titleOriginal,
  filmStudios,
  productionStudios,
  releaseDate,
  rating,
  copyright,
  score,
  scoreMax = SCORE_DISPLAY_MAX,
  comment,
}: PostHeaderProps) => {
  const locale = useLocale()
  const sep = t(messages, ['meta', 'sep'], locale)

  const year = releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : undefined
  const distributors = filmStudios?.map((s) => s.name).join(' / ')
  const productions = productionStudios?.map((s) => s.name).join(' / ')

  const metaParts = [distributors, productions, year, rating].filter(Boolean)
  const prefix = 'post-header'
  return (
    <div className={prefix}>
      <hgroup className={`${prefix}__hgroup`}>
        {comment && <p className={`${prefix}__comment`}>{comment}</p>}
        <h1 className={`${prefix}__title-main`}>{titleOfficial}</h1>
      </hgroup>
      <div className={`${prefix}__lower`}>
        <div className={`${prefix}__meta-group`}>
          {titleOriginal && <p className={`${prefix}__title-original`}>{titleOriginal}</p>}
          {metaParts.length > 0 && (
            <p className={`${prefix}__meta`}>
              {metaParts.map((part, i) => (
                <span key={i}>
                  {i > 0 && <span className={`${prefix}__meta-sep`}>{sep}</span>}
                  {part}
                </span>
              ))}
            </p>
          )}
          {copyright && <p className={`${prefix}__copyright`}>{copyright}</p>}
        </div>
        {score !== undefined && (
          <div className={`${prefix}__rank`}>
            <ScoreWithRank value={score} max={scoreMax} />
          </div>
        )}
      </div>
    </div>
  )
}
