import type { VodService as TVodService } from '@/lib/vod';

export type TVodMenuService = {
  service: TVodService;
  label: string;
  status: boolean;
  href: string;
};
