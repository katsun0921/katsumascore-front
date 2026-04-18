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
      className='flex items-center text-[var(--font-size-h2-sm)]'
      onClick={() => clickHamburgerMenu()}
    >
      <span className='relative block w-[30px] h-[24px]'>
        <span className='hamburgerMenu__line absolute left-0 block w-full h-1 top-1 -translate-y-1/2 bg-current transition-[transform,opacity] duration-300 ease-out'></span>
        <span className='hamburgerMenu__line absolute left-0 block w-full h-1 top-1/2 -translate-y-1/2 bg-current transition-[transform,opacity] duration-300 ease-out'></span>
        <span className='hamburgerMenu__line absolute left-0 block w-full h-1 bottom-0 -translate-y-1/2 bg-current transition-[transform,opacity] duration-300 ease-out'></span>
      </span>
      <span className='ml-2 block h-[24px]'>{label}</span>
    </button>
  );
};
