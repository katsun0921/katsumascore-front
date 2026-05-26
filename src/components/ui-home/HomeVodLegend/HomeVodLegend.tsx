import { VOD_COLOR_VAR, VOD_INITIAL, VOD_LABEL } from '@/libs/vod';
import type { HomeVodLegendProps } from './HomeVodLegend.types';

export const HomeVodLegend = ({ title, services }: HomeVodLegendProps) => {
  if (services.length === 0) return null;
  return (
    <section className='homeVodLegend' aria-label={title}>
      <h2 className='homeVodLegend__title'>{title}</h2>
      <ul className='homeVodLegend__list'>
        {services.map((vod) => (
          <li key={vod} className='homeVodLegend__item'>
            <span
              className='homeVodLegend__badge'
              style={{ background: VOD_COLOR_VAR[vod] }}
              aria-hidden='true'
            >
              {VOD_INITIAL[vod]}
            </span>
            <span className='homeVodLegend__name'>{VOD_LABEL[vod]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
