import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { type VodService, VOD_BORDER_CLASS } from '@/libs/vod';
import { VOD_CONFIG } from '@/config/vod.config';
import { messages } from './i18n';

/** @deprecated VodService を使用してください */
export type TVodService = VodService

export type TVodItemProps = {
  service: VodService
  isPaid?: boolean
}

export const VodItem = ({
  service,
  isPaid = false,
}: TVodItemProps) => {
  const locale = useLocale();
  const label = VOD_CONFIG[service].label;

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-color-border-muted bg-color-bg p-4 ${VOD_BORDER_CLASS[service]}`}
    >
      {isPaid && (
        <em className='block text-color-secondary [font-size:var(--font-size-caption-lg)] italic'>
          {t(messages, ['paid', 'notice'], locale)}
        </em>
      )}
      <div className='flex items-center gap-2'>
        <span className='font-bold [font-size:var(--font-size-body-sm)]'>{label}</span>
      </div>
    </div>
  );
};
