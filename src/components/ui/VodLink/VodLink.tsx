import Link from 'next/link';

export const VodLink = () => {
  return (
    <Link
      href='/vod'
      className='inline-flex items-center gap-[6px] px-[14px] py-[6px] border border-[var(--color-primary)] rounded text-[var(--color-primary)] text-[0.875rem] font-medium whitespace-nowrap transition-[background-color,color] duration-200 ease-[ease] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] hover:opacity-100'
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
      {/* eslint-disable-next-line katsumascore-ui/no-hardcoded-i18n */}
      <span>配信中作品</span>
    </Link>
  );
};
