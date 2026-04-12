import { Score } from '@/components/ui/Score/Score'
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay'
import { getRankingIcon } from '@/components/ui/Score/getRankingIcon'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import './WorkInfo.scss'

// アフィリエイト対象サービスの表示順（仕様書 §3.❷ 準拠）
const VOD_ORDER = ['unext', 'amazon', 'hulu', 'netflix', 'disney'] as const
type VodService = (typeof VOD_ORDER)[number]

// 各サービスの表示設定
const VOD_CONFIG: Record<VodService, { label: string; isAffiliate: boolean }> = {
  unext:   { label: 'U-NEXT',             isAffiliate: true },
  amazon:  { label: 'Amazon Prime Video', isAffiliate: true },
  hulu:    { label: 'Hulu',               isAffiliate: true },
  netflix: { label: 'Netflix',            isAffiliate: false },
  disney:  { label: 'Disney+',            isAffiliate: false },
}

export type WorkInfoVod = {
  unext?: boolean
  amazon?: boolean
  hulu?: boolean
  netflix?: boolean
  disney?: boolean
}

export type WorkInfoProps = {
  score: number
  title: string
  year?: string
  genre?: string
  isCinema?: boolean
  vod?: WorkInfoVod
}

export const WorkInfo = ({
  score,
  title,
  year,
  genre,
  isCinema = false,
  vod,
}: WorkInfoProps) => {
  const locale = useLocale()
  const rank = getRankingIcon(score)

  // 表示する VOD を順番通りに絞り込む
  const activeVods = vod
    ? VOD_ORDER.filter((key) => vod[key] === true)
    : []

  const showVodSection = !isCinema && activeVods.length > 0

  return (
    <div className='sidebar-work-info'>
      {/* スコア + ランク */}
      <div className='sidebar-work-info__score-block'>
        <Score value={score} max={SCORE_DISPLAY_MAX} />
        {rank && (
          <img
            src={rank.src}
            alt={`rank ${rank.label}`}
            width={32}
            height={32}
            className='sidebar-work-info__rank-icon'
          />
        )}
      </div>

      {/* 作品タイトル */}
      <p className='sidebar-work-info__title'>{title}</p>

      {/* メタ情報（年 / ジャンル） */}
      {(year || genre) && (
        <p className='sidebar-work-info__meta'>
          {year && (
            <span>
              {year}{t(messages, ['meta', 'year'], locale)}
            </span>
          )}
          {year && genre && <span className='sidebar-work-info__meta-sep'>/</span>}
          {genre && <span>{genre}</span>}
        </p>
      )}

      {/* VOD バッジ */}
      {isCinema ? (
        <div className='sidebar-work-info__vod'>
          <span className='sidebar-work-info__badge sidebar-work-info__badge--cinema'>
            {t(messages, ['meta', 'cinema'], locale)}
          </span>
        </div>
      ) : showVodSection ? (
        <div className='sidebar-work-info__vod'>
          <p className='sidebar-work-info__vod-heading'>
            {t(messages, ['vod', 'heading'], locale)}
          </p>
          <div className='sidebar-work-info__badges'>
            {activeVods.map((key) => (
              <span
                key={key}
                className={[
                  'sidebar-work-info__badge',
                  `sidebar-work-info__badge--${key}`,
                  VOD_CONFIG[key].isAffiliate
                    ? 'sidebar-work-info__badge--affiliate'
                    : 'sidebar-work-info__badge--info',
                ].join(' ')}
              >
                {VOD_CONFIG[key].label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
