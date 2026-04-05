import React from 'react';
import Link from 'next/link';
import './VodLink.scss';

export const VodLink = () => {
  return (
    <Link
      href='/vod'
      className='vodLink'
      aria-label='配信中作品を探す'
    >
      <svg
        className='vodLink__icon'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='currentColor'
        aria-hidden='true'
        width='16'
        height='16'
      >
        <path d='M8 5v14l11-7z' />
      </svg>
      <span className='vodLink__label'>配信中作品</span>
    </Link>
  );
};
