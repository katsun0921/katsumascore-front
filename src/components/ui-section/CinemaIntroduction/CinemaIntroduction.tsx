import Link from 'next/link';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type TCinemaIntroductionProps = {
  title: string
  publishedAt: string
  isShowing: boolean
  cinemaUrl?: string
  officialUrl?: string
}

export const CinemaIntroduction = ({
  title,
  publishedAt,
  isShowing,
  cinemaUrl,
  officialUrl,
}: TCinemaIntroductionProps) => {
  const locale = useLocale();
  const dateLocale = locale === 'en' ? 'en-US' : 'ja-JP';
  const dateStr = new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(publishedAt));
  const text = (path: string[]) => t(messages, path, locale);

  return (
    <section data-component='CinemaIntroduction'>
      <h2 className='font-heading text-h3 font-bold leading-[1.5] text-color-primary mb-3'>
        {text(['heading', 'prefix'])}
        {title}
        {text(['heading', 'suffix'])}
      </h2>
      {isShowing ? (
        <>
          <p className='text-body leading-[1.7] text-color-primary mb-4'>
            {text(['showing', 'bodyPrefix'])}
            {title}
            {text(['showing', 'bodySuffix'])}
          </p>
          {cinemaUrl && (
            <Link href={cinemaUrl} target='_blank' rel='noopener noreferrer' className='text-primary no-underline hover:underline'>
              {text(['showing', 'theaterLinkPrefix'])}
              {title}
              {text(['showing', 'theaterLinkSuffix'])}
            </Link>
          )}
        </>
      ) : (
        <p className='text-body leading-[1.7] text-color-primary mb-4'>
          {text(['notShowing', 'bodyPrefix'])}
          {dateStr}
          {text(['notShowing', 'bodySuffix'])}
        </p>
      )}
      <p className='text-ui text-color-secondary mt-4 font-bold'>
        {text(['note', 'prefix'])}
        {dateStr}
        {text(['note', 'suffix'])}
        {officialUrl && (
          <>
            {' '}
            <Link href={officialUrl} target='_blank' rel='noopener noreferrer' className='text-primary no-underline hover:underline'>
              {text(['note', 'officialLinkPrefix'])}
              {title}
              {text(['note', 'officialLinkSuffix'])}
            </Link>
          </>
        )}
      </p>
    </section>
  );
};
