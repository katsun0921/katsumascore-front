import type { VodService } from '@/lib/vod';

export type VodDotsProps = {
  vods: VodService[];
  max?: number;
  className?: string;
};
