import type { TVodMenuService } from '@/components/features/VodMenu/VodMenu.types';

type TVodMenuItemProps = {
  item: TVodMenuService;
};

export const VodMenuItem = ({ item }: TVodMenuItemProps) => {
  return (
    <li>
      <a
        href={item.href}
        className='flex items-center justify-between px-4 py-2 text-ui text-color-primary transition-[background-color] duration-150 ease-[ease] hover:bg-color-bg-muted hover:opacity-100'
        target='_blank'
        rel='noopener noreferrer'
      >
        <span>{item.label}</span>
        <span
          className='text-[var(--font-size-caption-lg)] text-color-muted'
          aria-label={item.status ? '配信中' : '配信なし'}
        >
          {item.status ? '✔' : '✖'}
        </span>
      </a>
    </li>
  );
};
