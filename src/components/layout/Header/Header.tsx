import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container/Container';
import { Navigation } from '@/components/layout/Navigation/Navigation';
import { Search } from '@/components/ui/Search/Search';
import { VodLink } from '@/components/ui/VodLink/VodLink';

export const Header = () => {
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
            <Search />
            <div className='hidden lg:block'>
              <VodLink />
            </div>
          </div>
        </Container>
      </div>
      <Navigation />
    </header>
  );
};
