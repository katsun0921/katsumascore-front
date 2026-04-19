import Link from 'next/link';

export const VodLink = () => {
  return (
    <Link
      href='/vod'
      className='inline-flex items-center gap-2 rounded border border-[var(--color-primary)] px-3 py-2 text-[var(--font-size-ui-lg)] font-medium whitespace-nowrap text-[var(--color-primary)] transition-[background-color,color] duration-200 ease-[ease] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] hover:opacity-100'
      aria-label='配信中作品を探す'
    >
      <svg
        className='shrink-0'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='currentColor'
        aria-hidden='true'
        width='16'
        height='16'
      >
        <path d='M8 5v14l11-7z' />
      </svg>
      <span>配信中作品</span>
    </Link>
  );
};
