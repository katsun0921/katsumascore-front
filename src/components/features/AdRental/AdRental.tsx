import { AdRental as AdRentalSection } from '@/components/ui-section/AdRental/AdRental'
import { adRentalConfig } from './AdRental.config'

type TAdRentalProps = {
  title: string,
  locale?: 'ja' | 'en'
}

export const AdRental = ({ title, locale = 'ja' }: TAdRentalProps) => {

  if (locale === 'en') {
    return null
  }

  const { headingSuffix } = adRentalConfig
  const heading = `${title}${headingSuffix}`
  return <AdRentalSection heading={heading}  />
}
