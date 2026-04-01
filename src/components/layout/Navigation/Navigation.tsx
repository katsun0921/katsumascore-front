import React, { useEffect } from 'react';
import { ListHeader } from '@/components/ui/List/ListHeader';
import { HamburgerMenu } from '@/components/ui/HamburgerMenu/HamburgerMenu';
import { changeClassWhenResizeOnNavigation } from '@/hooks/useNavigation';

export const Navigation = ({}) => {
  useEffect(() => {
    changeClassWhenResizeOnNavigation();
    window.addEventListener('resize', changeClassWhenResizeOnNavigation);
    return () => {
      window.removeEventListener('resize', changeClassWhenResizeOnNavigation);
    };
  }, []);

  return (
    <div className='l-navigation l-navigation--isDesktop'>
      <div className='l-navigation__menuButton u-flex u-justify-center u-items-center u-gap-x-4'>
        <HamburgerMenu label='MENU' />
      </div>
      <nav id='js-mobile-menu' className='l-navigation__list u-opacity-0'>
        <ListHeader />
      </nav>
    </div>
  );
};
