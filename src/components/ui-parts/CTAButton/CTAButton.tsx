import Link from 'next/link';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import { PlayIcon } from '@/assets/icons';

type Props = {
  href: string;
  fullWidth?: boolean;
};

export const CTAButton = ({ href, fullWidth = false }: Props) => {
  const locale = useLocale();

  const className = fullWidth
    ? 'flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--color-primary)] px-4 text-[var(--font-size-body-sm)] font-medium tracking-[0.04em] whitespace-nowrap text-[var(--color-text-inverse)] hover:opacity-[0.85]'
    : 'inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-primary)] px-4 py-2 font-medium tracking-[0.04em] whitespace-nowrap text-[var(--color-text-inverse)] hover:opacity-[0.85]';

  return (
    <Link href={href} className={className}>
      <PlayIcon className='block shrink-0' width='16' height='16' aria-hidden='true' />
      <span className='block'>{t(messages, ['button', 'label'], locale)}</span>
    </Link>
  );
};
