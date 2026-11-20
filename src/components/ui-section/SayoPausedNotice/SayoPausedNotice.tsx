import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type SayoPausedNoticeProps = {
  /** paused：WordPress の停止フラグ／limit：回数の上限／closed：ai-chat が受付終了（health） */
  reason: 'paused' | 'limit' | 'closed';
  /** WordPress の案内文。null なら既定文 */
  message?: string | null;
  /** 再開予定（ISO 8601） */
  resumeAt?: string | null;
  /** 明るい背景（モーダル）か、暗い背景（入口・ノベル画面）か */
  tone?: 'light' | 'dark';
  className?: string;
};

/**
 * 再開予定を「12月1日 0:00」の形にする。読めない値は null
 * @param iso ISO 8601 の日時
 */
const formatResumeAt = (iso: string, locale: 'ja' | 'en'): string | null => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', {
    month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Tokyo',
  }).format(d);
};

/** LLMを使う会話を止めているときの案内。サヨのせりふではなく、システムの表示として出す */
export const SayoPausedNotice = ({ reason, message, resumeAt, tone = 'light', className }: SayoPausedNoticeProps) => {
  const locale = useLocale();
  const when = resumeAt ? formatResumeAt(resumeAt, locale) : null;
  return (
    <div data-component='SayoPausedNotice' role='status' className={['sayoPausedNotice', `sayoPausedNotice--${tone}`, className].filter(Boolean).join(' ')}>
      <p className='sayoPausedNotice__text'>{message || t(messages, ['default', reason], locale)}</p>
      {when && <p className='sayoPausedNotice__when'>{t(messages, ['resume'], locale)}：{when}</p>}
      <p className='sayoPausedNotice__sub'>{t(messages, ['stillOk'], locale)}</p>
    </div>
  );
};
