import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Container } from '@/components/layout/Container/Container';
import { Navigation } from '@/components/layout/Navigation/Navigation';
import { Search } from '@/components/ui/Search/Search';
import { VodMenu } from '@/components/ui/VodMenu/VodMenu';
import type { TVodMenuService } from '@/components/ui/VodMenu/VodMenu.types';

const vodServices: TVodMenuService[] = [
  { service: 'netflix', label: 'Netflix', status: true, href: '/vod/netflix' },
  { service: 'amazon', label: 'Amazon Prime', status: true, href: '/vod/amazon' },
  { service: 'unext', label: 'U-NEXT', status: false, href: '/vod/unext' },
];

export const Header = () => {
  const router = useRouter();

  return (
    <header className='bg-[var(--color-header)]' role='banner'>
      <div className='py-3'>
        <Container>
          <div className='flex items-center justify-between'>
            <h1 className='m-0 leading-none'>
              <Link href='/' className='block hover:opacity-85 transition-opacity duration-200'>
                <Image
                  src='/images/logo.webp'
                  alt='KatsumaScore'
                  className='block w-[100px] h-auto'
                  width={100}
                  height={40}
                />
              </Link>
            </h1>
            <Search onNavigate={router.push} />
            <div className='hidden lg:block'>
              <VodMenu services={vodServices} />
            </div>
          </div>
        </Container>
      </div>
      <Navigation />
    </header>
  );
};
