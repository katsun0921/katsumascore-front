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
  locale?: 'ja' | 'en'
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
  locale = 'ja',
}: TVodItemProps) => {
  const label = SERVICE_LABELS[service]
  const defaultStreamingText =
    streamingText ||
    (locale === 'en'
      ? 'You can access the distribution by following this link.'
      : '配信はこちらのリンクから移動できます。')
  const defaultUnregisteredText =
    unregisteredText ||
    (locale === 'en'
      ? 'If you have not yet registered, you can do so here.'
      : '未登録の方はこちらから登録できます。')

  return (
    <div className={`flex flex-col gap-2 p-4 rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg)] ${serviceTopBorder[service]}`}>
      {isPaid && (
        <em className='block text-[12px] text-[var(--color-text-secondary)] italic'>
          {locale === 'en' ? 'This distribution is paid.' : 'この配信は有料になります。'}
        </em>
      )}
      <div className='flex items-center gap-2'>
        <span className='text-[15px] font-bold'>{label}</span>
      </div>
      {signupUrl && (
        <a
          className='block text-[13px] text-[var(--color-text-secondary)] hover:underline hover:opacity-100'
          href={signupUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          {defaultUnregisteredText}
        </a>
      )}
      <a
        className='inline-block px-4 py-2 rounded text-[14px] font-bold text-center bg-[var(--color-primary)] text-[var(--color-text-inverse)] transition-opacity duration-150 hover:opacity-[0.85]'
        href={streamingUrl}
        target='_blank'
        rel='noopener noreferrer'
      >
        {defaultStreamingText}
      </a>
    </div>
  )
}
