import { VOD_COLOR_VAR } from '@/libs/vod';
import type { VodDotsProps } from './VodDots.types';

export const VodDots = ({ vods, max = 3, className }: VodDotsProps) => {
  if (vods.length === 0) return null;
  const shown = vods.slice(0, max);
  return (
    <div className={['flex gap-1', className].filter(Boolean).join(' ')} aria-hidden='true'>
      {shown.map((vod) => (
        <span
          key={vod}
          className='flex w-4 h-4 items-center justify-center rounded text-caption font-bold leading-none text-[var(--color-text-inverse)]'
          style={{ background: VOD_COLOR_VAR[vod] }}
          aria-label={vod}
        >
          {vod[0].toUpperCase()}
        </span>
      ))}
    </div>
  );
};
