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
    ? 'flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--color-primary)] px-4 text-[var(--font-size-body-sp)] font-medium tracking-[0.04em] whitespace-nowrap text-[var(--color-text-inverse)] hover:opacity-[0.85]'
    : 'inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-primary)] px-4 py-2 text-[var(--font-size-ui-pc)] font-medium tracking-[0.04em] whitespace-nowrap text-[var(--color-text-inverse)] hover:opacity-[0.85]'

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
