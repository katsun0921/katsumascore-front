import Link from 'next/link';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

type Props = {
  href: string;
  fullWidth?: boolean;
};

export const CTAButton = ({ href, fullWidth = false }: Props) => {
  const locale = useLocale();

  const className = fullWidth
    ? 'flex justify-center items-center gap-[6px] w-full h-[44px] px-4 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-[8px] text-[0.9375rem] font-medium tracking-[0.04em] whitespace-nowrap hover:opacity-[0.85]'
    : 'inline-flex items-center gap-[6px] px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-[6px] text-[0.875rem] font-medium tracking-[0.04em] whitespace-nowrap hover:opacity-[0.85]'

  return (
    <Link href={href} className={className}>
      <svg
        className='block shrink-0'
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='currentColor'
        aria-hidden='true'
      >
        <path d='M8 5v14l11-7z' />
      </svg>
      <span className='block'>{t(messages, ['button', 'label'], locale)}</span>
    </Link>
  );
};
