import { SayoFaceButton } from '@/components/ui-parts/SayoFaceButton';
import { useSayoOptional } from '@/components/features/sayo/useSayo';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type SayoCardActionProps = {
  /** 記事ID（ai-chat の索引の ID） */
  articleId: number;
  title: string;
  /** 同じ並びの記事ID（モーダルの「前の作品／次の作品」に使う） */
  groupIds?: number[];
  /** long：リストの先頭記事など、文言を長く／compact：顔だけ */
  size?: 'short' | 'long' | 'compact';
  className?: string;
};

/** カードの action スロットに渡す「要約」ボタン。サヨを出さないときは何も描かない */
export const SayoCardAction = ({ articleId, title, groupIds, size = 'short', className }: SayoCardActionProps) => {
  const sayo = useSayoOptional();
  const locale = useLocale();
  if (!sayo?.visible) return null;
  const label = t(messages, ['label', size === 'long' ? 'long' : 'short'], locale);
  return (
    <SayoFaceButton
      label={label}
      ariaLabel={`『${title}』${t(messages, ['aria'], locale)}`}
      compact={size === 'compact'}
      className={className}
      onClick={() => sayo.openSummary(articleId, groupIds ?? [articleId], document.activeElement as HTMLElement | null)}
    />
  );
};
