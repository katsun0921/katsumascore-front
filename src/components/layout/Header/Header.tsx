import React from 'react';
import { Container } from '@/components/layout/Container/Container';
import { Navigation } from '@/components/layout/Navigation/Navigation';
import './Header.scss';

export const Header = () => {
  return (
    <header className='l-header' role='banner'>
      <div className='l-header__top'>
        <Container>
          <div className='l-header__inner'>
            <h1 className='l-header__logo'>
              <a href='/' rel='home' className='l-header__logoLink'>
                <img
                  src='https://katsumascore.blog/images/logo-primary.png'
                  alt='KatsumaScore'
                  className='l-header__logoImage'
                  width='100'
                  height='auto'
                />
              </a>
            </h1>
          </div>
        </Container>
      </div>
      <Navigation />
    </header>
  );
};
