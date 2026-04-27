import { CinemaCheck as CinemaCheckSection } from '@/components/ui-section/CinemaCheck';
import { cinemaCheckConfig } from '@/components/ui-section/CinemaCheck/CinemaCheck.config';
import { useLocale } from '@/i18n/provider';

export type TCinemaCheckProps = {
  isCinemaShowing: boolean
  titleJp?: string
}

export const CinemaCheck = ({ isCinemaShowing, titleJp }: TCinemaCheckProps) => {
  const locale = useLocale();

  if (!isCinemaShowing) return null;

  const { badgeLabel, fallbackTitle, messageSuffix } = cinemaCheckConfig[locale];
  const message = `${titleJp || fallbackTitle}${messageSuffix}`;

  return <CinemaCheckSection badgeLabel={badgeLabel} message={message} />;
};
