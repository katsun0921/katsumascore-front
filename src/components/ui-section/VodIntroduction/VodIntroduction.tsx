import Image from 'next/image'
import Link from 'next/link'
import { PostCardListVertical } from '@/components/ui-section/PostCard'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import type { Post } from '@/types/post'
import { messages } from './i18n'

type TWrittenFrom = { type: 'vod'; vodName: string; vodUrl: string; vodImageUrl?: string }

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

  const { vodName, vodUrl, vodImageUrl } = writtenFrom
  const dateLocale = locale === 'en' ? 'en-US' : 'ja-JP'
  const dateStr = new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(publishedAt))
  const text = (path: string[]) => t(messages, path, locale)

  return (
    <section>
      <h2 className='text-h3 font-bold leading-normal mb-3'>
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
      <p className='text-body leading-[1.7] mb-4'>
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
      <Link
        href={vodUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-3 no-underline text-[var(--color-text-primary)] mb-6 hover:opacity-80'
      >
        {vodImageUrl && (
          <div className='relative w-[120px] h-[60px] shrink-0'>
            <Image src={vodImageUrl} alt={`${vodName} ${title}`} fill sizes='200px' className='object-contain' />
          </div>
        )}
        <span className='text-body font-medium'>{vodName} {title}</span>
      </Link>
      {relatedPosts.length > 0 && (
        <div className='mt-6'>
          <h3 className='font-heading text-body font-bold mb-3'>
            {text(['vod', 'relatedHeading', 'prefix'])}
            {vodName}
            {text(['vod', 'relatedHeading', 'suffix'])}
          </h3>
          <PostCardListVertical posts={relatedPosts} />
        </div>
      )}
      <p className='text-ui text-[var(--color-text-secondary)] mt-4 font-bold'>
        {text(['vod', 'note', 'prefix'])}
        {dateStr}
        {text(['vod', 'note', 'middle'])}
        {vodName}
        {text(['vod', 'note', 'suffix'])}
      </p>
    </section>
  )
}
