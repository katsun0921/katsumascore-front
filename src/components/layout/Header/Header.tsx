import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Search } from '@/components/ui/Search/Search';
import { CTAButton } from '@/components/ui/CTAButton/CTAButton';
import { HeaderNav } from '@/components/ui/HeaderNav/HeaderNav';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export const Header = () => {
  const router = useRouter();
  const locale = useLocale();

  return (
    <header className='bg-[var(--color-header)]' role='banner'>

      {/* ─── PC レイアウト：md以上で表示 ──────────────────────────── */}
      <div className='hidden md:flex h-16 items-center justify-between px-6'>
        <div className='flex items-center shrink-0'>
          <Link href='/' className='block hover:opacity-80 transition-opacity duration-200'>
            <Image
              src='/images/logo.webp'
              alt={t(messages, ['logo', 'alt'], locale)}
              width={120}
              height={40}
              unoptimized
              className='block h-10 w-auto'
            />
          </Link>
        </div>

        <div className='flex flex-1 items-center justify-center gap-3 px-6'>
          <Search onNavigate={router.push} className='header-search-pc' />
          <CTAButton href='/vod' />
        </div>

        <div className='flex items-center shrink-0'>
          <HeaderNav layout='pc' />
        </div>
      </div>

      {/* ─── SP レイアウト：md未満で表示 ──────────────────────────── */}
      <div className='md:hidden'>
        <div className='flex h-14 items-center gap-3 px-4'>
          <Link href='/' className='block shrink-0 hover:opacity-80 transition-opacity duration-200'>
            <Image
              src='/images/logo.webp'
              alt={t(messages, ['logo', 'alt'], locale)}
              width={120}
              height={36}
              unoptimized
              className='block h-9 w-auto'
            />
          </Link>
          <div className='flex-1'>
            <Search onNavigate={router.push} className='header-search-sp' />
          </div>
        </div>

        <div className='mx-4 my-2'>
          <CTAButton href='/vod' fullWidth />
        </div>

        <HeaderNav layout='sp' />
      </div>

    </header>
  );
};
