import Link from 'next/link';
import { useRouter } from 'next/router';
import { POST_TYPE_ARCHIVE_NAV_ITEMS } from '@/config/wpContent.config';
import type { Locale } from '@/i18n/t';
import { t } from '@/i18n/t';
import { getPostTypeArchivePath } from '@/libs/route';
import { messages } from './i18n';

export const HeaderNav = () => {
  const { asPath, locale: routerLocale } = useRouter();
  const loc: Locale = routerLocale === 'en' ? 'en' : 'ja';
  const path0 = asPath.split('?')[0] ?? '';

  return (
    <nav data-component='HeaderNav' className='headerNav' aria-label={t(messages, ['root', 'aria'], loc)}>
      <ul className='headerNav__list'>
        {POST_TYPE_ARCHIVE_NAV_ITEMS.map((item) => {
          const archiveBase = getPostTypeArchivePath({ type: item.postType, lang: loc });
          const isActive = path0 === archiveBase || path0.startsWith(`${archiveBase}/`);
          return (
            <li key={item.postType}>
              <Link
                href={archiveBase}
                locale={false}
                className={`headerNav__link${isActive ? ' headerNav__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label[loc]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
