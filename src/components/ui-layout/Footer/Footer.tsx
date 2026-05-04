import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { XIcon, FacebookIcon, RssIcon } from '@/assets/icons';
import { POST_TYPE_ARCHIVE_NAV_ITEMS } from '@/config/wpContent.config';
import type { Locale } from '@/i18n/t';
import { t } from '@/i18n/t';
import { getPostTypeArchivePath } from '@/libs/route';
import { messages } from './i18n';

type MetaKey = 'about' | 'privacy' | 'contact';
type SnsKey = 'x' | 'facebook' | 'rss';

const META_ITEMS: { key: MetaKey; href: string }[] = [
  { key: 'about', href: '/about' },
  { key: 'privacy', href: '/privacy-policy' },
  { key: 'contact', href: '/contact' },
];

const SNS_ITEMS: {
  key: SnsKey;
  href: string;
  icon: ReactNode;
}[] = [
  {
    key: 'x',
    href: 'https://twitter.com/Katsun0921',
    icon: <XIcon className='w-[18px] h-[18px]' aria-hidden='true' />,
  },
  {
    key: 'facebook',
    href: 'https://www.facebook.com/people/Katsumascore/100072246676709/',
    icon: <FacebookIcon className='w-[18px] h-[18px]' aria-hidden='true' />,
  },
  {
    key: 'rss',
    href: 'https://katsumascore.blog/feed/',
    icon: <RssIcon className='w-[18px] h-[18px]' aria-hidden='true' />,
  },
];

export const Footer = () => {
  const { locale: routerLocale } = useRouter();
  const loc: Locale = routerLocale === 'en' ? 'en' : 'ja';
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-footer py-20 pb-14 text-center'>
      <div className='flex flex-col items-center'>

        {/* 1. Catchcopy */}
        <p className='footer-catchcopy text-sm'>
          {t(messages, ['catchcopy', 'line'], loc)}
        </p>

        {/* 2. Site name */}
        <p className='footer-sitename mt-5 text-2xl font-semibold uppercase'>
          {t(messages, ['sitename', 'text'], loc)}
        </p>

        {/* 3. Divider */}
        <div className='footer-divider mt-10 w-10 h-px' aria-hidden='true' />

        {/* 4. Categories */}
        <nav className='mt-10' aria-label={t(messages, ['nav', 'categories', 'aria'], loc)}>
          <ul className='flex gap-9 sm:gap-6'>
            {POST_TYPE_ARCHIVE_NAV_ITEMS.map((item) => {
              const name = item.label[loc];
              const href = getPostTypeArchivePath({ type: item.postType, lang: loc });
              return (
                <li key={item.postType}>
                  <Link
                    href={href}
                    locale={false}
                    className='footer-category-link text-sm font-medium block py-1'
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 5. SNS */}
        <ul className='flex gap-6 mt-10' aria-label={t(messages, ['nav', 'sns', 'aria'], loc)}>
          {SNS_ITEMS.map(({ key, href, icon }) => {
            const label = t(messages, ['sns', key, 'label'], loc);
            return (
              <li key={key}>
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
            );
          })}
        </ul>

        {/* 6. Meta links */}
        <nav className='mt-10' aria-label={t(messages, ['nav', 'siteInfo', 'aria'], loc)}>
          <ul className='flex flex-wrap justify-center gap-7 sm:gap-4'>
            {META_ITEMS.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className='footer-meta-link text-[var(--font-size-caption-sm)] block py-1'>
                  {t(messages, ['metaLinks', key, 'label'], loc)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 7. Copyright */}
        <small className='footer-copyright mt-10 text-[var(--font-size-caption-sm)]'>
          {t(messages, ['copyright', 'line'], loc).replaceAll('{year}', String(currentYear))}
        </small>

      </div>
    </footer>
  );
};
