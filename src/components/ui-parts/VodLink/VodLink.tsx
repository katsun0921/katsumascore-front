import Link from 'next/link';
import { PlayIcon } from '@/assets/icons';

export const VodLink = () => {
  return (
    <Link
      href='/vod'
      className='inline-flex items-center gap-2 rounded border border-[var(--color-primary)] px-3 py-2 text-[length:var(--font-size-ui-lg)] font-medium whitespace-nowrap text-[var(--color-primary)] transition-[background-color,color] duration-200 ease-[ease] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] hover:opacity-100'
      aria-label='配信中作品を探す'
    >
      <PlayIcon className='shrink-0' width='16' height='16' aria-hidden='true' />
      <span>配信中作品</span>
    </Link>
  );
};
