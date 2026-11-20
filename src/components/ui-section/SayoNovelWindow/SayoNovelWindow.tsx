import type { ReactNode } from 'react';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type SayoNovelWindowProps = {
  /** 名前札：サヨか、あなたか */
  speaker: 'sayo' | 'user';
  /** 本文（1文字ずつの制御は features 側） */
  children: ReactNode;
  /** ネタバレの印を出す */
  spoiler?: boolean;
  /** 読み終わりの ▼ を出す */
  done?: boolean;
  /** ウィンドウを押したとき（1文字ずつの表示を飛ばす） */
  onClick?: () => void;
  className?: string;
};

/** ノベル画面のメッセージウィンドウ（名前札・ネタバレの印・本文・▼） */
export const SayoNovelWindow = ({ speaker, children, spoiler = false, done = false, onClick, className }: SayoNovelWindowProps) => {
  const locale = useLocale();
  return (
    <div data-component='SayoNovelWindow' className={['sayoNovelWindow', className].filter(Boolean).join(' ')} aria-live='polite' onClick={onClick}>
      <span className={`sayoNovelWindow__plate${speaker === 'user' ? ' sayoNovelWindow__plate--user' : ''}`}>
        {speaker === 'user' ? t(messages, ['plate', 'user'], locale) : (
          <>
            {t(messages, ['plate', 'sayo'], locale)}
            <small>{t(messages, ['plate', 'role'], locale)}</small>
          </>
        )}
      </span>
      {spoiler && <span className='sayoNovelWindow__badge'>{t(messages, ['spoiler'], locale)}</span>}
      <div className='sayoNovelWindow__text'>{children}</div>
      {done && <span className='sayoNovelWindow__next' aria-hidden='true'>▼</span>}
    </div>
  );
};
