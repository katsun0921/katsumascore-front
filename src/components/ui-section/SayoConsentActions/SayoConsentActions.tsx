import { useId } from 'react';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type SayoConsentActionsProps = {
  /** チェックボックスに印が付いているか */
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** 「同意して始める」。checked が false の間は押せない */
  onAgree: () => void;
  /** 「今はやめる」 */
  onCancel: () => void;
  /** 開いたときにチェックボックスへフォーカスを置くか */
  autoFocus?: boolean;
  className?: string;
};

/**
 * 同意画面の下部：同意のチェックボックスと「今はやめる」「同意して始める」。
 * 印の状態は持たず、props で受け取る（状態は同意画面の features が持つ）
 */
export const SayoConsentActions = ({ checked, onCheckedChange, onAgree, onCancel, autoFocus, className }: SayoConsentActionsProps) => {
  const locale = useLocale();
  const hintId = useId();
  return (
    <div data-component='SayoConsentActions' className={['sayoConsentActions', className].filter(Boolean).join(' ')}>
      <label className='sayoConsentActions__check'>
        <input
          type='checkbox'
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          aria-describedby={hintId}
          autoFocus={autoFocus}
        />
        <span>{t(messages, ['check'], locale)}</span>
      </label>
      <p id={hintId} className='sayoConsentActions__hint'>{checked ? '' : t(messages, ['hint'], locale)}</p>
      <div className='sayoConsentActions__buttons'>
        <button type='button' className='sayoConsentActions__cancel' onClick={onCancel}>{t(messages, ['cancel'], locale)}</button>
        <button type='button' className='sayoConsentActions__agree' onClick={onAgree} disabled={!checked}>{t(messages, ['agree'], locale)}</button>
      </div>
    </div>
  );
};
