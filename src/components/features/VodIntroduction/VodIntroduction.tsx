import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { CinemaIntroduction } from '@/components/ui-section/CinemaIntroduction'
import type { Post } from '@/types/post'
import { messages } from './i18n'
import './VodIntroduction.scss'

type TWrittenFrom =
  | { type: 'cinema'; isShowing: boolean; cinemaUrl?: string; officialUrl?: string }
  | { type: 'vod'; vodName: string; vodUrl: string; vodImageUrl?: string }

export type TVodIntroductionProps = {
  titleJp: string
  titleEn?: string
  writtenFrom: TWrittenFrom
  publishedAt: string
  updatedAt?: string
  relatedPosts?: Post[]
}

export const VodIntroduction = ({
  titleJp,
  titleEn,
  writtenFrom,
  publishedAt,
  relatedPosts = [],
}: TVodIntroductionProps) => {
  const locale = useLocale()
  const title = locale === 'en' ? (titleEn || titleJp) : titleJp

  if (writtenFrom.type === 'cinema') {
    const { isShowing, cinemaUrl, officialUrl } = writtenFrom
    return (
      <CinemaIntroduction
        title={title}
        publishedAt={publishedAt}
        isShowing={isShowing}
        cinemaUrl={cinemaUrl}
        officialUrl={officialUrl}
      />
    )
  }

  // type === 'vod'
  const { vodName, vodUrl, vodImageUrl } = writtenFrom
  const dateLocale = locale === 'en' ? 'en-US' : 'ja-JP'
  const dateStr = new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(publishedAt))
  const text = (path: string[]) => t(messages, path, locale)

  return (
    <section className='p-vod-intro'>
      <h2 className='p-vod-intro__heading'>
        {locale === 'en' ? (
          <>
            {text(['vod', 'heading', 'prefix'])}
            {title}
            {text(['vod', 'heading', 'middle'])}
            {vodName}
            {text(['vod', 'heading', 'suffix'])}
          </>
        ) : (
          <>
            {text(['vod', 'heading', 'prefix'])}
            {vodName}
            {text(['vod', 'heading', 'middle'])}
            {title}
            {text(['vod', 'heading', 'suffix'])}
          </>
        )}
      </h2>
      <p className='p-vod-intro__body'>
        {locale === 'en' ? (
          <>
            {text(['vod', 'body', 'prefix'])}
            {title}
            {text(['vod', 'body', 'middle'])}
            {vodName}
            {text(['vod', 'body', 'suffixPrefix'])}
            {vodName}
            {text(['vod', 'body', 'suffix'])}
          </>
        ) : (
          <>
            {vodName}
            {text(['vod', 'body', 'middle'])}
            {title}
            {text(['vod', 'body', 'suffixPrefix'])}
            {vodName}
            {text(['vod', 'body', 'suffix'])}
          </>
        )}
      </p>
      <Link href={vodUrl} target='_blank' rel='noopener noreferrer' className='p-vod-intro__vod-link'>
        {vodImageUrl && (
          <div className='p-vod-intro__vod-image'>
            <Image src={vodImageUrl} alt={`${vodName} ${title}`} fill sizes='200px' />
          </div>
        )}
        <span className='p-vod-intro__vod-name'>{vodName} {title}</span>
      </Link>
      {relatedPosts.length > 0 && (
        <div className='p-vod-intro__related'>
          <h3 className='p-vod-intro__related-heading'>
            {text(['vod', 'relatedHeading', 'prefix'])}
            {vodName}
            {text(['vod', 'relatedHeading', 'suffix'])}
          </h3>
          <ul className='p-vod-intro__related-list'>
            {relatedPosts.map((post) => (
              <li key={post.id}>
                <Link href={post.slug} className='p-vod-intro__related-item'>
                  {post.image && (
                    <div className='p-vod-intro__related-thumb'>
                      <Image src={post.image} alt={post.title} fill sizes='200px' />
                    </div>
                  )}
                  <span className='p-vod-intro__related-title'>{post.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className='p-vod-intro__note'>
        {text(['vod', 'note', 'prefix'])}
        {dateStr}
        {text(['vod', 'note', 'middle'])}
        {vodName}
        {text(['vod', 'note', 'suffix'])}
      </p>
    </section>
  )
}
