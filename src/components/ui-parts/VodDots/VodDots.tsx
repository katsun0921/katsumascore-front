import { VOD_COLOR_VAR, VOD_LABEL } from '@/libs/vod';
import type { VodDotsProps } from './VodDots.types';

export const VodDots = ({ vods, max = 3, className }: VodDotsProps) => {
  if (vods.length === 0) return null;
  const shown = vods.slice(0, max);
  return (
    <div className={['flex gap-1', className].filter(Boolean).join(' ')}>
      {shown.map((vod) => (
        <span
          key={vod}
          className='block w-2 h-2 rounded-full'
          style={{ background: VOD_COLOR_VAR[vod] }}
          aria-label={VOD_LABEL[vod]}
        />
      ))}
    </div>
  );
};
