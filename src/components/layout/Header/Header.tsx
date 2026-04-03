import React from 'react';
import { Search } from '@/components/ui/Search/Search';
import { Navigation } from '@/components/layout/Navigation/Navigation';
import { ListSocialIcon } from '@/components/ui/ListSocialIcon/ListSocialIcon';

export const Header = ({}) => {
  return (
    <header id='masthead-pro'>
      <div className='grid grid-cols-2 grid-rows-2 gap-0 bg-[var(--color-header)] p-[15px] md:flex md:items-center md:justify-between md:px-[50px] md:py-0'>
        <div className='col-[1/2] row-[1/2] my-auto'>
          <h1
            id='logo-pro'
            className='m-0 w-28 py-3 leading-none'
          >
            <a href='/' rel='home'>
              <img
                src='https://katsumascore.blog/images/logo-primary.png'
                alt=''
                className='w-24'
                width='100'
              />
            </a>
          </h1>
        </div>
        <div className='col-[1/3] row-[2/3] m-auto md:m-0'>
          <Search />
        </div>
        <div className='col-[2/3] row-[1/2] my-auto ml-auto'>
          <ListSocialIcon />
        </div>
      </div>
      <Navigation />
    </header>
  );
};
