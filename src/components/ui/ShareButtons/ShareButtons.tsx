import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'

export type TShareButtonsProps = {
  url: string
  title: string
}

export const ShareButtons = ({ url, title }: TShareButtonsProps) => {
  const locale = useLocale()
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <p className='m-0 text-[var(--font-size-ui-sm)] font-bold text-[var(--color-text-secondary)]'>
        {t(messages, ['label', 'share'], locale)}
      </p>
      <ul className='m-0 flex list-none gap-2 p-0'>
        <li>
          <a
            className='inline-flex items-center justify-center rounded px-3 py-2 text-[var(--font-size-ui-sm)] font-bold no-underline text-[var(--color-text-inverse)] bg-[var(--color-x)] transition-opacity duration-150 hover:opacity-85'
            href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t(messages, ['btn', 'x'], locale)}
          >
            X
          </a>
        </li>
        <li>
          <a
            className='inline-flex items-center justify-center rounded px-3 py-2 text-[var(--font-size-ui-sm)] font-bold no-underline text-[var(--color-text-inverse)] bg-[var(--color-facebook)] transition-opacity duration-150 hover:opacity-85'
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t(messages, ['btn', 'facebook'], locale)}
          >
            Facebook
          </a>
        </li>
        <li>
          <a
            className='inline-flex items-center justify-center rounded px-3 py-2 text-[var(--font-size-ui-sm)] font-bold no-underline text-[var(--color-text-inverse)] bg-[var(--color-line)] transition-opacity duration-150 hover:opacity-85'
            href={`https://line.me/R/msg/text/?${encodedTitle}%0D%0A${encodedUrl}`}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t(messages, ['btn', 'line'], locale)}
          >
            LINE
          </a>
        </li>
      </ul>
    </div>
  )
}
