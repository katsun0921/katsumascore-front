import { VodPanel as VodPanelSection } from '@/components/ui-section/VodPanel';
import { vodPanelConfig } from '@/components/ui-section/VodPanel/VodPanel.config';
import { VodItem } from '@/components/ui-section/VodItem';
import { useLocale } from '@/i18n/provider';
import type { VodService as TVodService } from '@/libs/vod';

export type TVodPanelEntry = {
  service: TVodService
  url: string
  signupUrl?: string
  isPaid?: boolean
}

export type TVodPanelProps = {
  services: TVodPanelEntry[]
  isCinema?: boolean
  titleJp?: string
}

export const VodPanel = ({ services, isCinema = false, titleJp }: TVodPanelProps) => {
  const locale = useLocale();
  const { cinemaBadgeLabel, cinemaNote, listHeading, listHeadingSuffix } = vodPanelConfig[locale];

  if (isCinema) {
    return <VodPanelSection variant='cinema' badgeLabel={cinemaBadgeLabel} note={cinemaNote} />;
  }

  const active = services.filter((s) => s.url);
  if (!active.length) return null;

  const heading = titleJp ? (locale === 'en' ? listHeading : `${titleJp}${listHeadingSuffix}`) : undefined;
  const items = active.map((entry, index) => (
    <VodItem
      key={`${entry.service}-${index}`}
      service={entry.service}
      streamingUrl={entry.url}
      signupUrl={entry.signupUrl}
      isPaid={entry.isPaid}
    />
  ));

  return <VodPanelSection variant='list' heading={heading} items={items} />;
};
