import type { VodService as TVodService } from '@/libs/vod';

export type TVodMenuService = {
  service: TVodService;
  label: string;
  status: boolean;
  href: string;
};
