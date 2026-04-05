import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { name: '映画', href: '/category/movie' },
  { name: 'アニメ', href: '/category/anime' },
  { name: 'ドラマ', href: '/category/drama' },
];

const VOD_LINKS = [
  { name: 'Netflix', href: '/vod/netflix' },
  { name: 'Amazon Prime', href: '/vod/amazon' },
  { name: 'U-NEXT', href: '/vod/unext' },
];

const META_LINKS = [
  { name: 'サイトについて', href: '/about' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'お問い合わせ', href: '/contact' },
];

const SNS_LINKS = [
  {
    label: 'X (Twitter)',
    href: 'https://twitter.com/Katsun0921',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true' focusable='false' className='w-[18px] h-[18px]'>
        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/people/Katsumascore/100072246676709/',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true' focusable='false' className='w-[18px] h-[18px]'>
        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
      </svg>
    ),
  },
  {
    label: 'RSS',
    href: 'https://katsumascore.blog/feed/',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true' focusable='false' className='w-[18px] h-[18px]'>
        <path d='M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z' />
      </svg>
    ),
  },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-[var(--color-footer)] py-20 pb-14 text-center'>
      <div className='flex flex-col items-center'>

        {/* 1. Catchcopy */}
        <p className='footer-catchcopy text-sm'>
          スコアは、物語のあとに生まれる。
        </p>

        {/* 2. Site name */}
        <p className='footer-sitename mt-5 text-2xl font-semibold uppercase'>
          Katsumascore
        </p>

        {/* 3. Divider */}
        <div className='footer-divider mt-10 w-10 h-px' aria-hidden='true' />

        {/* 4. Categories */}
        <nav className='mt-10' aria-label='カテゴリ'>
          <ul className='flex gap-9 sm:gap-6'>
            {CATEGORIES.map(({ name, href }) => (
              <li key={name}>
                <Link href={href} className='footer-category-link text-sm font-medium block py-1'>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 5. VOD */}
        <nav className='mt-4' aria-label='配信サービス'>
          <ul className='flex flex-wrap justify-center gap-7 sm:gap-4'>
            {VOD_LINKS.map(({ name, href }) => (
              <li key={name}>
                <Link href={href} className='footer-vod-link text-[11px] block py-1'>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 6. SNS */}
        <ul className='flex gap-6 mt-10' aria-label='SNSリンク'>
          {SNS_LINKS.map(({ label, href, icon }) => (
            <li key={label}>
              <a
                href={href}
                target='_blank'
                rel='noreferrer noopener'
                className='footer-sns-link flex items-center justify-center w-9 h-9'
                aria-label={label}
              >
                {icon}
              </a>
            </li>
          ))}
        </ul>

        {/* 7. Meta links */}
        <nav className='mt-10' aria-label='サイト情報'>
          <ul className='flex flex-wrap justify-center gap-7 sm:gap-4'>
            {META_LINKS.map(({ name, href }) => (
              <li key={name}>
                <Link href={href} className='footer-meta-link text-[11px] block py-1'>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 8. Copyright */}
        <small className='footer-copyright mt-10 text-[10px]'>
          &copy; {currentYear} Katsumascore. All rights reserved.
        </small>

      </div>
    </footer>
  );
};
