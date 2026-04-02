import React from 'react';
import { clickHamburgerMenu } from '@/hooks/useHamburgerMenu';

type THamburgerMenuProps = {
  label: string;
};

export const HamburgerMenu = ({ label }: THamburgerMenuProps) => {
  return (
    <button
      type='button'
      id='js-menu-button'
      onClick={() => clickHamburgerMenu()}
    >
      <span>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span>{label}</span>
    </button>
  );
};
