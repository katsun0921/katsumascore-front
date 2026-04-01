import React from 'react';
import { Search } from '@/components/ui/Search/Search';
import { Navigation } from '@/components/layout/Navigation/Navigation';
import { ListSocialIcon } from '@/components/ui/List/ListSocialIcon';

export const Header = ({}) => {
  return (
    <header id='masthead-pro'>
      <div className='l-header'>
        <div className='l-header__logo'>
          <h1
            id='logo-pro'
            className='u-m-0 u-py-3 u-w-28 u-leading-none logo-inside-nav-pro noselect'
          >
            <a href='/' rel='home'>
              <img
                src='https://katsumascore.blog/images/logo-primary.png'
                alt=''
                className='u-w-24'
                width='100'
              />
            </a>
          </h1>
        </div>
        <div className='l-header__search'>
          <Search />
        </div>
        <div className='l-header__snsLinks'>
          <ListSocialIcon />
        </div>
      </div>
      <Navigation />
    </header>
  );
};
