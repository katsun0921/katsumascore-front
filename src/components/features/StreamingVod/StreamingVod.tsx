import { StreamingVod as StreamingVodSection } from '@/components/ui-section/StreamingVod';
import { streamingVodConfig } from '@/components/ui-section/StreamingVod/StreamingVod.config';
import { VodItem } from '@/components/ui-section/VodItem';
import { useLocale } from '@/i18n/provider';
import type { VodService as TVodService } from '@/libs/vod';

export type TStreamingVodEntry = {
  service: TVodService
  url: string
  isPaid?: boolean
}

export type TStreamingVodProps = {
  title?: string
  services: TStreamingVodEntry[]
}

export const StreamingVod = ({ title, services }: TStreamingVodProps) => {
  const locale = useLocale();

  if (!services.length) return null;

  const { defaultHeading, headingPrefix, headingSuffix } = streamingVodConfig[locale];
  const heading = title ? `${headingPrefix}${title}${headingSuffix}` : defaultHeading;
  const items = services.map((entry, index) => (
    <VodItem
      key={`${entry.service}-${index}`}
      service={entry.service}
      isPaid={entry.isPaid}
    />
  ));

  return <StreamingVodSection heading={heading} items={items} />;
};
