import { VodItem } from '@/components/features/vod/VodItem/VodItem'
import { StreamingVod as StreamingVodSection } from '@/components/ui-section/StreamingVod/StreamingVod'
import { streamingVodConfig } from '@/components/ui-section/StreamingVod/StreamingVod.config'
import type { VodService as TVodService } from '@/lib/vod'

export type TStreamingVodEntry = {
  service: TVodService
  url: string
  signupUrl?: string
  isPaid?: boolean
}

export type TStreamingVodProps = {
  titleJp?: string
  titleEn?: string
  services: TStreamingVodEntry[]
  locale?: 'ja' | 'en'
}

export const StreamingVod = ({ titleJp, titleEn, services, locale = 'ja' }: TStreamingVodProps) => {
  if (!services.length) return null

  const title = locale === 'en' ? titleEn : titleJp
  const { defaultHeading, headingPrefix, headingSuffix } = streamingVodConfig[locale]
  const heading = title ? `${headingPrefix}${title}${headingSuffix}` : defaultHeading
  const items = services.map((entry, index) => (
    <VodItem
      key={`${entry.service}-${index}`}
      service={entry.service}
      streamingUrl={entry.url}
      signupUrl={entry.signupUrl}
      isPaid={entry.isPaid}
      locale={locale}
    />
  ))

  return <StreamingVodSection heading={heading} items={items} />
}
