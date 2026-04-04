import React from 'react';
import { clickHamburgerMenu } from '@/hooks/useHamburgerMenu';
import './HamburgerMenu.scss';

type THamburgerMenuProps = {
  label: string;
};

export const HamburgerMenu = ({ label }: THamburgerMenuProps) => {
  return (
    <button
      type='button'
      id='js-menu-button'
      className='hamburgerMenu'
      onClick={() => clickHamburgerMenu()}
    >
      <span className='hamburgerMenu__lineContainer'>
        <span className='hamburgerMenu__line'></span>
        <span className='hamburgerMenu__line'></span>
        <span className='hamburgerMenu__line'></span>
      </span>
      <span className='hamburgerMenu__label'>{label}</span>
    </button>
  );
};
