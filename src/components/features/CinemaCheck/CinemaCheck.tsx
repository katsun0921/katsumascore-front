import { CinemaCheck as CinemaCheckSection } from '@/components/ui-section/CinemaCheck'
import { cinemaCheckConfig } from '@/components/ui-section/CinemaCheck/CinemaCheck.config'

export type TCinemaCheckProps = {
  isCinemaShowing: boolean
  titleJp?: string
  locale?: 'ja' | 'en'
}

export const CinemaCheck = ({ isCinemaShowing, titleJp, locale = 'ja' }: TCinemaCheckProps) => {
  if (!isCinemaShowing) return null

  const { badgeLabel, fallbackTitle, messageSuffix } = cinemaCheckConfig[locale]
  const message = `${titleJp || fallbackTitle}${messageSuffix}`

  return <CinemaCheckSection badgeLabel={badgeLabel} message={message} />
}
