import type { ReactNode } from 'react';
import Image from 'next/image';
import { SAYO_FACE_SRC } from '@/libs/sayoAssets';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type SayoBubbleProps = {
  /** sayo：顔と名前つき（左）／user：利用者の発言（右） */
  speaker?: 'sayo' | 'user';
  children: ReactNode;
  className?: string;
};

/** 吹き出し。要約モーダル・探した結果で使う */
export const SayoBubble = ({ speaker = 'sayo', children, className }: SayoBubbleProps) => {
  const locale = useLocale();
  if (speaker === 'user') {
    return (
      <div data-component='SayoBubble' className={['flex justify-end', className].filter(Boolean).join(' ')}>
        <p className='max-w-[80%] rounded-[16px_4px_16px_16px] bg-[var(--color-secondary)] px-4 py-2 text-[length:var(--font-size-fixed-14)] leading-[1.85] text-[color:var(--color-text-inverse)]'>
          {children}
        </p>
      </div>
    );
  }
  return (
    <div data-component='SayoBubble' className={['flex gap-3', className].filter(Boolean).join(' ')}>
      <Image src={SAYO_FACE_SRC} alt='' width={40} height={40} className='h-10 w-10 flex-none rounded-full border-2 border-[var(--color-sayo-amber-soft)] object-cover' />
      <div className='min-w-0 flex-1'>
        <p className='text-[length:var(--font-size-caption)] text-[color:var(--color-sayo-sub)]'>{t(messages, ['name', 'sayo'], locale)}</p>
        <div className='rounded-[4px_16px_16px_16px] bg-[var(--color-sayo-amber-soft)] px-4 py-2 text-[length:var(--font-size-fixed-14)] leading-[1.85] text-[color:var(--color-sayo-text)]'>
          {children}
        </div>
      </div>
    </div>
  );
};
