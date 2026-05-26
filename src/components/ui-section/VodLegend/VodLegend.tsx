import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { VOD_COLOR_VAR, VOD_INITIAL, VOD_LABEL } from '@/libs/vod';
import { messages } from './i18n';
import type { VodLegendProps } from './VodLegend.types';

export const VodLegend = ({ services, className }: VodLegendProps) => {
  const locale = useLocale();
  if (services.length === 0) return null;
  const title = t(messages, ['title'], locale);
  return (
    <section
      className={['vodLegend', className].filter(Boolean).join(' ')}
      aria-label={title}
    >
      <h2 className='vodLegend__title'>{title}</h2>
      <ul className='vodLegend__list'>
        {services.map((vod) => (
          <li key={vod} className='vodLegend__item'>
            <span
              className='vodLegend__badge'
              style={{ background: VOD_COLOR_VAR[vod] }}
              aria-hidden='true'
            >
              {VOD_INITIAL[vod]}
            </span>
            <span className='vodLegend__name'>{VOD_LABEL[vod]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
