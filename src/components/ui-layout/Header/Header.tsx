import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Search } from '@/components/features/Search';
import { CTAButton } from '@/components/ui-parts/CTAButton';
import { HeaderNav } from '@/components/ui-parts/HeaderNav';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
export const Header = () => {
  const router = useRouter();
  const locale = useLocale();
  const prefixClassName = 'header';

  return (
    <header className='w-full bg-header' role='banner'>
      <div className={prefixClassName}>
        <Link href='/' className={`${prefixClassName}__logo hover:opacity-80 transition-opacity duration-200`}>
          <Image
            src='/images/logo.webp'
            alt={t(messages, ['logo', 'alt'], locale)}
            width={120}
            height={40}
            unoptimized
            className='block h-9 w-auto md:h-10'
          />
        </Link>

        <div className={`${prefixClassName}__search`}>
          <Search onNavigate={router.push} className={`${prefixClassName}-search`} />
        </div>

        <div className={`${prefixClassName}__cta`}>
          <CTAButton href='/vod' fullWidth />
        </div>

        <div className={`${prefixClassName}__nav`}>
          <HeaderNav />
        </div>
      </div>
    </header>
  );
};
