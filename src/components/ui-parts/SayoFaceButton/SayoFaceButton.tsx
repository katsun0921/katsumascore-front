import Image from 'next/image';
import { SAYO_FACE_SRC } from '@/libs/sayoAssets';

export type SayoFaceButtonProps = {
  /** ボタンの文言（例：要約／サヨに要約してもらう） */
  label: string;
  /** 読み上げ用の説明（例：『作品名』をサヨに要約してもらう） */
  ariaLabel: string;
  onClick: () => void;
  /** true で顔だけにする（SPのグリッドなど狭い場所） */
  compact?: boolean;
  className?: string;
};

/** カードの画像に重ねる、サヨの顔つきボタン。カードのリンクの「隣」に置く */
export const SayoFaceButton = ({ label, ariaLabel, onClick, compact = false, className }: SayoFaceButtonProps) => {
  const classes = [
    'inline-flex items-center gap-1 rounded-full pl-0 py-0 font-bold leading-none whitespace-nowrap cursor-pointer',
    'bg-[rgba(var(--color-bg-dark-rgb),0.78)] text-[color:var(--color-text-inverse)] text-[length:var(--font-size-fixed-12)]',
    'shadow-[0_0_0_1.5px_var(--color-accent-strong),0_4px_12px_rgba(var(--color-black-rgb),0.35)] backdrop-blur-sm',
    'transition-transform duration-150 hover:-translate-y-px hover:scale-105',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-soft)]',
    compact ? 'pr-0' : 'pr-2',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type='button' data-component='SayoFaceButton' className={classes} aria-label={ariaLabel} onClick={onClick}>
      <Image src={SAYO_FACE_SRC} alt='' width={24} height={24} className='h-6 w-6 rounded-full object-cover' />
      {!compact && <span>{label}</span>}
    </button>
  );
};
