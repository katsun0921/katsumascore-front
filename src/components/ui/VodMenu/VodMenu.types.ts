import type { TVodService } from '@/components/ui/VodItem/VodItem';

export type TVodMenuService = {
  service: TVodService;
  label: string;
  status: boolean;
  href: string;
};
