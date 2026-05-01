import type { VodService } from '@/libs/vod';

export type VodDotsProps = {
  vods: VodService[];
  max?: number;
  className?: string;
};
