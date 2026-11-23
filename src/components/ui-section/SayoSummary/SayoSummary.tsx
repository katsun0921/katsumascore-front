import { SayoBubble } from '@/components/ui-parts/SayoBubble';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { SayoSummary as SayoSummaryData } from '@/types/sayo';
import { messages } from './i18n';

export type SayoSummaryProps = {
  summary: SayoSummaryData;
  className?: string;
};

/** 承認済み要約の表示（書き出し・要約・こんな方に・気分タグ・注記） */
export const SayoSummary = ({ summary, className }: SayoSummaryProps) => {
  const locale = useLocale();
  return (
    <div data-component='SayoSummary' className={['sayoSummary', className].filter(Boolean).join(' ')}>
      <SayoBubble>
        <strong className='sayoSummary__lead'>{summary.lead}</strong>
        {summary.summary}
      </SayoBubble>
      <dl className='sayoSummary__facts'>
        {summary.recommendFor && (
          <div className='sayoSummary__fact'>
            <dt>{t(messages, ['recommendFor'], locale)}</dt>
            <dd>{summary.recommendFor}</dd>
          </div>
        )}
        {summary.moodTags.length > 0 && (
          <div className='sayoSummary__fact'>
            <dt>{t(messages, ['mood'], locale)}</dt>
            <dd className='sayoSummary__tags'>
              {summary.moodTags.map((tag) => <span key={tag}>{tag}</span>)}
            </dd>
          </div>
        )}
      </dl>
      <p className='sayoSummary__note'>{t(messages, ['note'], locale)}</p>
    </div>
  );
};
