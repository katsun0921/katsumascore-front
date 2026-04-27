import Link from 'next/link';
import { XIcon, FacebookIcon, RssIcon } from '@/assets/icons';
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
    icon: <XIcon className='w-[18px] h-[18px]' aria-hidden='true' />,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/people/Katsumascore/100072246676709/',
    icon: <FacebookIcon className='w-[18px] h-[18px]' aria-hidden='true' />,
  },
  {
    label: 'RSS',
    href: 'https://katsumascore.blog/feed/',
    icon: <RssIcon className='w-[18px] h-[18px]' aria-hidden='true' />,
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
                <Link href={href} className='footer-vod-link text-[var(--font-size-caption-sm)] block py-1'>
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
                <Link href={href} className='footer-meta-link text-[var(--font-size-caption-sm)] block py-1'>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 8. Copyright */}
        <small className='footer-copyright mt-10 text-[var(--font-size-caption-sm)]'>
          &copy; {currentYear} Katsumascore. All rights reserved.
        </small>

      </div>
    </footer>
  );
};
