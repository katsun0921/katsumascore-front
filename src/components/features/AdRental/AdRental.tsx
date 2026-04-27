import { AdRental as AdRentalSection } from '@/components/ui-section/AdRental';
import { useLocale } from '@/i18n/provider';
import { adRentalConfig } from './AdRental.config';

export type TRentalService = {
  service: string
  url: string
}

type TAdRentalProps = {
  title: string
}

export const AdRental = ({ title }: TAdRentalProps) => {
  const locale = useLocale();

  if (locale === 'en') {
    return null;
  }

  const { headingSuffix } = adRentalConfig;
  const heading = `${title}${headingSuffix}`;
  return <AdRentalSection heading={heading}  />;
};
