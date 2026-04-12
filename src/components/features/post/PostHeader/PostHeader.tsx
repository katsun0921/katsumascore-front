import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import type { TStudioEntry } from '@/components/features/TitleMeta/TitleMeta'
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
}: PostHeaderProps) {
  const locale = useLocale()
  const sep = t(messages, ['meta', 'sep'], locale)

  const year = releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : undefined
  const distributors = filmStudios?.map((s) => s.name).join(' / ')
  const productions = productionStudios?.map((s) => s.name).join(' / ')

  const metaParts = [distributors, productions, year, rating].filter(Boolean)

  return (
    <div className='post-header'>
      <p className='post-header__category'>{category}</p>
      <h1 className='post-header__title-ja'>{titleJa}</h1>
      {titleEn && <p className='post-header__title-en'>{titleEn}</p>}
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
  )
}
