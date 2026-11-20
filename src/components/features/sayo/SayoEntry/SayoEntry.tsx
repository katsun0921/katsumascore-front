import { SayoAskBox } from '@/components/ui-section/SayoAskBox';
import { SayoPausedNotice } from '@/components/ui-section/SayoPausedNotice';
import { useSayoOptional } from '@/components/features/sayo/useSayo';

export type SayoEntryProps = {
  className?: string;
};

/**
 * 「何を観ようか迷ったら」の入口。候補ボタンはいつでも使え、
 * LLMを使う自由入力は止めている間（停止・上限・受付終了）は出さずに案内を出す。
 */
export const SayoEntry = ({ className }: SayoEntryProps) => {
  const sayo = useSayoOptional();
  if (!sayo?.visible) return null;
  const { chips, category, block, status, openSearch } = sayo;
  const notice = block ? (
    <SayoPausedNotice
      reason={block}
      tone='dark'
      message={block === 'paused' ? status?.message : null}
      resumeAt={block === 'paused' ? status?.resumeAt : null}
    />
  ) : undefined;
  return (
    <SayoAskBox
      className={className}
      chips={chips}
      category={category}
      inputId={category ? `sayo-ask-${category}` : 'sayo-ask'}
      onChip={(label) => openSearch(label, 'chip', document.activeElement as HTMLElement | null)}
      onSubmit={block ? undefined : (text) => openSearch(text, 'free', document.activeElement as HTMLElement | null)}
      notice={notice}
    />
  );
};
