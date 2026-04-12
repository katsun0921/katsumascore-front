import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'

export type TVodService =
  | 'netflix'
  | 'amazon'
  | 'unext'
  | 'disney'
  | 'dmmtv'
  | 'youtube'
  | 'appletv'
  | 'abema'

export type TVodItemProps = {
  service: TVodService
  streamingUrl: string
  signupUrl?: string
  streamingText?: string
  unregisteredText?: string
  isPaid?: boolean
}

const SERVICE_LABELS: Record<TVodService, string> = {
  netflix: 'Netflix',
  amazon: 'Amazon Prime Video',
  unext: 'U-NEXT',
  disney: 'Disney+',
  dmmtv: 'DMM TV',
  youtube: 'YouTube',
  appletv: 'Apple TV+',
  abema: 'ABEMA',
}

const serviceTopBorder: Record<TVodService, string> = {
  netflix: '[border-top:3px_solid_var(--color-netflix)]',
  amazon: '[border-top:3px_solid_var(--color-amazon)]',
  unext: '[border-top:3px_solid_var(--color-unext)]',
  disney: '[border-top:3px_solid_var(--color-disney)]',
  dmmtv: '[border-top:3px_solid_var(--color-dmmtv)]',
  youtube: '[border-top:3px_solid_var(--color-youtube)]',
  appletv: '[border-top:3px_solid_var(--color-appletv)]',
  abema: '[border-top:3px_solid_var(--color-abema)]',
}

export const VodItem = ({
  service,
  streamingUrl,
  signupUrl,
  streamingText,
  unregisteredText,
  isPaid = false,
}: TVodItemProps) => {
  const locale = useLocale()
  const label = SERVICE_LABELS[service]
  const defaultStreamingText = streamingText || t(messages, ['streaming', 'text'], locale)
  const defaultUnregisteredText = unregisteredText || t(messages, ['signup', 'text'], locale)

  return (
    <div className={`flex flex-col gap-2 p-4 rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg)] ${serviceTopBorder[service]}`}>
      {isPaid && (
        <em className='block [font-size:var(--font-size-caption-pc)] text-[var(--color-text-secondary)] italic'>
          {t(messages, ['paid', 'notice'], locale)}
        </em>
      )}
      <div className='flex items-center gap-2'>
        <span className='[font-size:var(--font-size-body-sp)] font-bold'>{label}</span>
      </div>
      {signupUrl && (
        <a
          className='block [font-size:var(--font-size-ui-sp)] text-[var(--color-text-inverse)] hover:underline hover:opacity-100'
          href={signupUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          {defaultUnregisteredText}
        </a>
      )}
      <a
        className='inline-block px-4 py-2 rounded [font-size:var(--font-size-ui-pc)] font-bold text-center bg-[var(--color-primary)] text-[var(--color-text-inverse)] transition-opacity duration-150 hover:opacity-[0.85]'
        href={streamingUrl}
        target='_blank'
        rel='noopener noreferrer'
      >
        {defaultStreamingText}
      </a>
    </div>
  )
}
