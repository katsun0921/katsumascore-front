import Image from 'next/image';
import { sayoFullSrc } from '@/libs/sayoAssets';

export type SayoDeepButtonProps = {
  /** 例：『作品名』を詳しく知りたい */
  title: string;
  /** 補足（例：見どころ・似た作品・結末まで…） */
  description: string;
  onClick: () => void;
  className?: string;
};

/** 「詳しく知りたい」ボタン。押すとノベル風の画面へ切り替える */
export const SayoDeepButton = ({ title, description, onClick, className }: SayoDeepButtonProps) => {
  const classes = [
    'flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left cursor-pointer',
    'bg-[linear-gradient(135deg,var(--color-surface-dark),var(--color-sayo-surface-dark-2))] text-[color:var(--color-text-inverse)]',
    'shadow-[0_0_0_1.5px_var(--color-accent-strong)] transition-transform duration-150 hover:-translate-y-px',
    'hover:shadow-[0_0_0_2px_var(--color-accent-strong),0_8px_20px_rgba(var(--color-accent-strong-rgb),0.3)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sayo-amber)]',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type='button' data-component='SayoDeepButton' className={classes} onClick={onClick}>
      <Image
        src={sayoFullSrc()}
        alt=''
        width={52}
        height={52}
        className='h-12 w-12 flex-none rounded-full object-cover object-[32%_14%] shadow-[0_0_0_2px_var(--color-sayo-amber)]'
      />
      <span className='flex min-w-0 flex-1 flex-col gap-1'>
        <strong className='text-[length:var(--font-size-body)] leading-[1.4]'>{title}</strong>
        <small className='text-[length:var(--font-size-caption)] leading-[1.5] text-[color:var(--color-sayo-text-dim)]'>{description}</small>
      </span>
      <span aria-hidden='true' className='text-[length:var(--font-size-h3)] text-[color:var(--color-accent-strong)]'>▶</span>
    </button>
  );
};
