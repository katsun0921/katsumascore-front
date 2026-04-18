import Image from 'next/image'
import Link from 'next/link'
import type { Post } from '@/types/post'
import './VodIntroduction.scss'

// どちらで執筆されたか
type TWrittenFrom =
  | { type: 'cinema'; isShowing: boolean; cinemaUrl?: string; officialUrl?: string }
  | { type: 'vod'; vodName: string; vodUrl: string; vodImageUrl?: string; isAffiliate?: boolean; affiliateCode?: string }

export type TVodIntroductionProps = {
  titleJp: string
  titleEn?: string
  writtenFrom: TWrittenFrom
  publishedAt: string
  updatedAt?: string
  relatedPosts?: Post[]
  locale?: 'ja' | 'en'
}

export const VodIntroduction = ({
  titleJp,
  titleEn,
  writtenFrom,
  publishedAt,
  updatedAt,
  relatedPosts = [],
  locale = 'ja',
}: TVodIntroductionProps) => {
  const title = locale === 'en' ? (titleEn || titleJp) : titleJp
  const dateStr = locale === 'en'
    ? new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : (() => {
        const d = new Date(publishedAt)
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
      })()

  if (writtenFrom.type === 'cinema') {
    const { isShowing, cinemaUrl, officialUrl } = writtenFrom
    return (
      <section className='p-vod-intro'>
        <h2 className='p-vod-intro__heading'>
          {locale === 'en' ? `Written ${titleEn || titleJp}.` : `${titleJp}を執筆しました。`}
        </h2>
        {isShowing ? (
          <>
            <p className='p-vod-intro__body'>
              {locale === 'en'
                ? `Here are the synopsis, impressions, and ratings for ${title} that are in theaters.`
                : `公開中の${titleJp}のあらすじ、感想、評価を紹介しました。`}
            </p>
            {cinemaUrl && (
              <Link href={cinemaUrl} target='_blank' rel='noopener noreferrer' className='p-vod-intro__link'>
                {locale === 'en' ? `Theater information for ${title}` : `${titleJp}の劇場情報`}
              </Link>
            )}
          </>
        ) : (
          <p className='p-vod-intro__body'>
            {locale === 'en'
              ? `As of ${dateStr}, this film is no longer in theaters.`
              : `${dateStr}時点では劇場公開が終了しております。`}
          </p>
        )}
        <p className='p-vod-intro__note'>
          {locale === 'en'
            ? `The information on this page is current as of ${dateStr}.`
            : `本ページの情報は${dateStr}時点のものです。`}
          {officialUrl && (
            <>
              {' '}
              <Link href={officialUrl} target='_blank' rel='noopener noreferrer' className='p-vod-intro__link'>
                {locale === 'en' ? `Check ${title} site for the latest information.` : `最新の状況は${titleJp}サイトにてご確認ください。`}
              </Link>
            </>
          )}
        </p>
      </section>
    )
  }

  // type === 'vod'
  const { vodName, vodUrl, vodImageUrl, isAffiliate, affiliateCode } = writtenFrom
  return (
    <section className='p-vod-intro'>
      <h2 className='p-vod-intro__heading'>
        {locale === 'en'
          ? `This page is written from the "${title}" which is available on ${vodName}.`
          : `このページでは${vodName}で配信中の${title}から執筆しました。`}
      </h2>
      <p className='p-vod-intro__body'>
        {locale === 'en'
          ? `This page introduces the synopsis, impressions, and ratings of "${title}" available on ${vodName}. If you are interested in this movie, please check it out at ${vodName}!`
          : `${vodName}で配信されている「${title}」のあらすじ、感想、評価を紹介しました。気になる方は、ぜひ下記URLの${vodName}からチェックしてみてください！`}
      </p>
      {isAffiliate && affiliateCode ? (
        <div dangerouslySetInnerHTML={{ __html: affiliateCode }} />
      ) : (
        <Link href={vodUrl} target='_blank' rel='noopener noreferrer' className='p-vod-intro__vod-link'>
          {vodImageUrl && (
            <div className='p-vod-intro__vod-image'>
              <Image src={vodImageUrl} alt={`${vodName} ${title}`} fill sizes='200px' />
            </div>
          )}
          <span className='p-vod-intro__vod-name'>{vodName} {title}</span>
        </Link>
      )}
      {relatedPosts.length > 0 && (
        <div className='p-vod-intro__related'>
          <h3 className='p-vod-intro__related-heading'>
            {locale === 'en'
              ? `I have also written reviews of other ${vodName} productions.`
              : `他にも${vodName}の作品レビューを書いています。`}
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
        {locale === 'en'
          ? `The information on this page is current as of ${dateStr}. Please check the ${vodName} site for the latest distribution status.`
          : `このページは${dateStr}時点のものです。最新の配信状況は${vodName}サイトにてご確認ください。`}
      </p>
    </section>
  )
}
