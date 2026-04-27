import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { type VodService, VOD_BORDER_CLASS, VOD_LABEL } from '@/lib/vod';
import { messages } from './i18n';

/** @deprecated VodService を使用してください */
export type TVodService = VodService

export type TVodItemProps = {
  service: VodService
  streamingUrl: string
  signupUrl?: string
  streamingText?: string
  unregisteredText?: string
  isPaid?: boolean
}

export const VodItem = ({
  service,
  streamingUrl,
  signupUrl,
  streamingText,
  unregisteredText,
  isPaid = false,
}: TVodItemProps) => {
  const locale = useLocale();
  const label = VOD_LABEL[service];
  const defaultStreamingText = streamingText || t(messages, ['streaming', 'text'], locale);
  const defaultUnregisteredText = unregisteredText || t(messages, ['signup', 'text'], locale);

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-4 ${VOD_BORDER_CLASS[service]}`}
    >
      {isPaid && (
        <em className='block text-[var(--color-text-secondary)] [font-size:var(--font-size-caption-lg)] italic'>
          {t(messages, ['paid', 'notice'], locale)}
        </em>
      )}
      <div className='flex items-center gap-2'>
        <span className='font-bold [font-size:var(--font-size-body-sm)]'>{label}</span>
      </div>
      {signupUrl && (
        <a
          className='block text-[var(--color-text-inverse)] [font-size:var(--font-size-ui-sm)] hover:opacity-100 hover:underline'
          href={signupUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          {defaultUnregisteredText}
        </a>
      )}
      <a
        className='inline-block rounded bg-[var(--color-primary)] px-4 py-2 text-center font-bold text-[var(--color-text-inverse)] [font-size:var(--font-size-ui-lg)] transition-opacity duration-150 hover:opacity-[0.85]'
        href={streamingUrl}
        target='_blank'
        rel='noopener noreferrer'
      >
        {defaultStreamingText}
      </a>
    </div>
  );
};
