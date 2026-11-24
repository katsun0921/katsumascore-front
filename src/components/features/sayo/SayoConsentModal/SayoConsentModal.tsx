import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { SAYO_FACE_SRC } from '@/libs/sayoAssets';
import { trapFocus } from '@/libs/focusTrap';
import { SayoConsentTerms } from '@/components/ui-section/SayoConsentTerms';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type SayoConsentModalProps = {
  /** チェックを入れて「同意して始める」を押したとき */
  onAgree: () => void;
  /** 「今はやめる」・✕・Esc・背景のクリック */
  onCancel: () => void;
  /** 規約を最初から開いておくか（Storybook 用） */
  defaultOpen?: boolean;
};

/**
 * はじめてサヨ（AI）を使う人に出す、利用規約の同意画面。
 * 規約は <details> で折りたたみ、チェックボックスに印を付けたときだけ「同意して始める」を押せる。
 * 同意の保存（localStorage）と、同意のあとに続ける操作は呼び出し側（SayoProvider）が持つ。
 */
export const SayoConsentModal = ({ onAgree, onCancel, defaultOpen }: SayoConsentModalProps) => {
  const locale = useLocale();
  const [checked, setChecked] = useState(false);
  const sheetRef = useRef<HTMLElement>(null);
  const checkRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const hintId = useId();

  useEffect(() => { checkRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Tab') trapFocus(e, sheetRef.current);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div data-component='SayoConsentModal' className='sayoConsentModal'>
      <div className='sayoConsentModal__scrim' onClick={onCancel} aria-hidden='true' />
      <section ref={sheetRef} className='sayoConsentModal__sheet' role='dialog' aria-modal='true' aria-labelledby={titleId}>
        <header className='sayoConsentModal__head'>
          <Image src={SAYO_FACE_SRC} alt='' width={48} height={48} className='sayoConsentModal__face' />
          <div className='sayoConsentModal__meta'>
            <p className='sayoConsentModal__label'>{t(messages, ['label'], locale)}</p>
            <h2 className='sayoConsentModal__title' id={titleId}>{t(messages, ['title'], locale)}</h2>
          </div>
          <button type='button' className='sayoConsentModal__close' onClick={onCancel} aria-label={t(messages, ['close'], locale)}>✕</button>
        </header>
        <div className='sayoConsentModal__scroll'>
          <SayoConsentTerms defaultOpen={defaultOpen} />
        </div>
        <footer className='sayoConsentModal__foot'>
          <label className='sayoConsentModal__check'>
            <input
              ref={checkRef}
              type='checkbox'
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              aria-describedby={hintId}
            />
            <span>{t(messages, ['check'], locale)}</span>
          </label>
          <p id={hintId} className='sayoConsentModal__hint'>{checked ? '' : t(messages, ['hint'], locale)}</p>
          <div className='sayoConsentModal__actions'>
            <button type='button' className='sayoConsentModal__cancel' onClick={onCancel}>{t(messages, ['cancel'], locale)}</button>
            <button type='button' className='sayoConsentModal__agree' onClick={onAgree} disabled={!checked}>{t(messages, ['agree'], locale)}</button>
          </div>
        </footer>
      </section>
    </div>
  );
};
