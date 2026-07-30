import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { type VodService, VOD_BORDER_CLASS } from '@/libs/vod';
import { VOD_CONFIG } from '@/config/vod.config';
import { messages } from './i18n';

/** @deprecated VodService を使用してください */
export type TVodService = VodService

export type TViewingType = 'subscription' | 'rental'

export type TVodItemProps = {
  service: VodService
  streamingUrl: string
  viewingType?: TViewingType
  isPaid?: boolean
}

export const VodItem = ({
  service,
  streamingUrl,
  viewingType,
  isPaid = false,
}: TVodItemProps) => {
  const locale = useLocale();
  const label = VOD_CONFIG[service].label;

  return (
    <div
      data-component='VodItem'
      className={`flex flex-col gap-2 rounded-lg border border-color-border-muted bg-color-bg p-4 ${VOD_BORDER_CLASS[service]}`}
    >
      {isPaid && (
        <em className='block text-color-secondary [font-size:var(--font-size-caption-lg)] italic'>
          {t(messages, ['paid', 'notice'], locale)}
        </em>
      )}
      <a
        className='font-bold [font-size:var(--font-size-body-sm)] hover:underline'
        href={streamingUrl}
        target='_blank'
        rel='noopener noreferrer'
      >
        {label}
      </a>
      {viewingType && (
        <span className='text-color-secondary [font-size:var(--font-size-caption-lg)]'>
          {t(messages, ['viewingType', viewingType], locale)}
        </span>
      )}
    </div>
  );
};
