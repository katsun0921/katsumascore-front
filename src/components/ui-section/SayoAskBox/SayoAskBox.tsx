import type { FormEvent, ReactNode } from 'react';
import Image from 'next/image';
import { SAYO_FACE_SRC } from '@/libs/sayoAssets';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type SayoAskBoxProps = {
  /** 候補ボタンの文言（気分タグで探す） */
  chips: string[];
  /** リストページのカテゴリ名（例：映画）。TOPは未指定 */
  category?: string;
  onChip: (label: string) => void;
  /** 自由入力の送信。未指定なら入力欄を出さない（停止中など） */
  onSubmit?: (text: string) => void;
  /** 入力欄の代わりに出すもの（停止中の案内など） */
  notice?: ReactNode;
  /** 同じページに複数置くときの input の id */
  inputId?: string;
  className?: string;
};

/** 「何を観ようか迷ったら」の入口。入力は非制御で、送信時に値を取り出して渡す */
export const SayoAskBox = ({ chips, category, onChip, onSubmit, notice, inputId = 'sayo-ask', className }: SayoAskBoxProps) => {
  const locale = useLocale();
  const title = category ? `${category}${t(messages, ['title', 'scoped'], locale)}` : t(messages, ['title', 'all'], locale);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('sayo-ask') as HTMLInputElement | null;
    const text = input?.value.trim() ?? '';
    if (!text || !onSubmit) return;
    onSubmit(text);
    if (input) input.value = '';
  };

  return (
    <section data-component='SayoAskBox' className={['sayoAskBox', className].filter(Boolean).join(' ')} aria-label={title}>
      <Image src={SAYO_FACE_SRC} alt='' width={52} height={52} className='sayoAskBox__face' />
      <div className='sayoAskBox__main'>
        <p className='sayoAskBox__title'>
          {title}
          <small>{t(messages, ['subtitle'], locale)}</small>
        </p>
        <div className='sayoAskBox__chips'>
          {chips.map((label) => (
            <button key={label} type='button' className='sayoAskBox__chip' onClick={() => onChip(label)}>
              {label}
            </button>
          ))}
        </div>
        {onSubmit && (
          <form className='sayoAskBox__form' onSubmit={handleSubmit}>
            <label className='sayoAskBox__srOnly' htmlFor={inputId}>{t(messages, ['form', 'label'], locale)}</label>
            <input id={inputId} name='sayo-ask' maxLength={200} autoComplete='off' placeholder={t(messages, ['form', 'placeholder'], locale)} />
            <button type='submit'>{t(messages, ['form', 'submit'], locale)}</button>
          </form>
        )}
        {notice}
        <p className='sayoAskBox__hint'>{t(messages, ['hint'], locale)}</p>
      </div>
    </section>
  );
};
