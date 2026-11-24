import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent, SyntheticEvent } from 'react';
import Image from 'next/image';
import { SAYO_FACE_SRC } from '@/libs/sayoAssets';
import { SayoConsentTerms } from '@/components/ui-section/SayoConsentTerms';
import { SayoConsentActions } from '@/components/ui-section/SayoConsentActions';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { SayoConsentScreenProps } from '@/types/sayo';
import { messages } from './i18n';

export type SayoConsentDialogProps = SayoConsentScreenProps;

/**
 * はじめてサヨ（AI）を使う人に出す、利用規約の同意画面（<dialog> のパターン）。
 * ブラウザの <dialog> を showModal() で開くので、最前面への表示・背景の操作の無効化・Esc・フォーカスの閉じ込めはブラウザが受け持つ。
 * 規約は折りたたまず、画面の中でスクロールして全文を読める。
 * チェックボックスに印を付けたときだけ「同意して始める」を押せる。
 * 同意の保存（localStorage）と、同意のあとに続ける操作は呼び出し側（SayoProvider）が持つ。
 * <details> で折りたたむパターンは SayoConsentModal
 */
export const SayoConsentDialog = ({ onAgree, onCancel }: SayoConsentDialogProps) => {
  const locale = useLocale();
  const [checked, setChecked] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // 描いたらすぐモーダルとして開き、外したら閉じる（開閉は SayoProvider が描く・外すで決める）
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    // showModal() は先頭のボタン（✕）にフォーカスを置くので、同意のチェックボックスへ移す
    dialog?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.focus();
    return () => dialog?.close();
  }, []);

  /** Esc：ブラウザに閉じさせず、呼び出し側の取り消しに任せる（描く・外すを SayoProvider に揃える） */
  const handleCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onCancel();
  };

  /** 背景（::backdrop）のクリック：クリックの対象が <dialog> 自身なら、中身の外を押したとき */
  const handleBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    // onClick は背景のクリックだけを拾う。キーボードでは Esc（cancel イベント）で閉じる
    <dialog
      ref={dialogRef}
      data-component='SayoConsentDialog'
      className='sayoConsentDialog'
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdrop}
    >
      <div className='sayoConsentDialog__inner'>
        <header className='sayoConsentDialog__head'>
          <Image src={SAYO_FACE_SRC} alt='' width={48} height={48} className='sayoConsentDialog__face' />
          <div className='sayoConsentDialog__meta'>
            <p className='sayoConsentDialog__label'>{t(messages, ['label'], locale)}</p>
            <h2 className='sayoConsentDialog__title' id={titleId}>{t(messages, ['title'], locale)}</h2>
          </div>
          <button type='button' className='sayoConsentDialog__close' onClick={onCancel} aria-label={t(messages, ['close'], locale)}>✕</button>
        </header>
        <div className='sayoConsentDialog__scroll'>
          <p className='sayoConsentDialog__lead'>{t(messages, ['lead'], locale)}</p>
          <section className='sayoConsentDialog__terms' aria-label={t(messages, ['termsHead'], locale)}>
            <h3 className='sayoConsentDialog__termsHead'>{t(messages, ['termsHead'], locale)}</h3>
            <SayoConsentTerms />
          </section>
        </div>
        <footer className='sayoConsentDialog__foot'>
          <SayoConsentActions checked={checked} onCheckedChange={setChecked} onAgree={onAgree} onCancel={onCancel} autoFocus />
        </footer>
      </div>
    </dialog>
  );
};
