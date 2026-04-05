import React, { useEffect } from 'react';
import { ListHeader } from '@/components/ui/ListHeader/ListHeader';
import { HamburgerMenu } from '@/components/ui/HamburgerMenu/HamburgerMenu';
import { VodLink } from '@/components/ui/VodLink/VodLink';
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
    <div className='l-navigation bg-[var(--color-navigation)]'>
      <div className='l-navigation__menuButton flex items-center justify-center gap-4 py-[25px] text-[var(--color-text-inverse)] lg:hidden'>
        <HamburgerMenu label='MENU' />
      </div>
      <nav id='js-mobile-menu' className='l-navigation__list hidden bg-[var(--color-header)] opacity-0 lg:block lg:bg-[var(--color-category)] lg:opacity-100'>
        <ListHeader />
        <div className='l-navigation__vodLink lg:hidden'>
          <VodLink />
        </div>
      </nav>
    </div>
  );
};
