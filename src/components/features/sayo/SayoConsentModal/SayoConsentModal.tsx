import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { SAYO_FACE_SRC } from '@/libs/sayoAssets';
import { trapFocus } from '@/libs/focusTrap';
import { SayoConsentTerms } from '@/components/ui-section/SayoConsentTerms';
import { SayoConsentActions } from '@/components/ui-section/SayoConsentActions';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { SayoConsentScreenProps } from '@/types/sayo';
import { messages } from './i18n';

export type SayoConsentModalProps = SayoConsentScreenProps & {
  /** 規約を最初から開いておくか（Storybook 用） */
  defaultOpen?: boolean;
};

/**
 * はじめてサヨ（AI）を使う人に出す、利用規約の同意画面（<details> のパターン）。
 * 規約は <details>（「利用規約を読む」）で折りたたみ、画面は短く保つ。
 * チェックボックスに印を付けたときだけ「同意して始める」を押せる。
 * 同意の保存（localStorage）と、同意のあとに続ける操作は呼び出し側（SayoProvider）が持つ。
 * <dialog> 要素で作るパターンは SayoConsentDialog
 */
export const SayoConsentModal = ({ onAgree, onCancel, defaultOpen = false }: SayoConsentModalProps) => {
  const locale = useLocale();
  const [checked, setChecked] = useState(false);
  const sheetRef = useRef<HTMLElement>(null);
  const titleId = useId();

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
          <p className='sayoConsentModal__lead'>{t(messages, ['lead'], locale)}</p>
          <details className='sayoConsentModal__details' open={defaultOpen}>
            <summary className='sayoConsentModal__summary'>{t(messages, ['summary'], locale)}</summary>
            <SayoConsentTerms className='sayoConsentModal__terms' />
          </details>
        </div>
        <footer className='sayoConsentModal__foot'>
          <SayoConsentActions checked={checked} onCheckedChange={setChecked} onAgree={onAgree} onCancel={onCancel} autoFocus />
        </footer>
      </section>
    </div>
  );
};
