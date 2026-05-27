import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { VOD_COLOR_VAR } from '@/libs/vod';
import { messages } from './i18n';
import type { VodLegendProps } from './VodLegend.types';

export const VodLegend = ({ services, className, badgeColor = 'dark' }: VodLegendProps) => {
  const locale = useLocale();
  if (services.length === 0) return null;
  const title = t(messages, ['title'], locale);
  return (
    <section
      className={['vodLegend', `vodLegend--badge-${badgeColor}`, className].filter(Boolean).join(' ')}
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
              {vod[0].toUpperCase()}
            </span>
            <span className='vodLegend__name'>{vod}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
