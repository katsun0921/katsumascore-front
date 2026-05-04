import Link from 'next/link';
import type { SearchResult } from '@/types/search';

type Props = {
  result: SearchResult;
  isActive: boolean;
  id: string;
  onClick: () => void;
};

export const SearchResultItem = ({ result, isActive, id, onClick }: Props) => {
  return (
    <li
      id={id}
      role='option'
      aria-selected={isActive}
      className={isActive ? 'bg-color-bg-muted' : ''}
    >
      <Link
        href={result.href}
        className='flex items-center justify-between gap-3 px-3 py-2 text-color-primary hover:bg-color-bg-muted hover:opacity-100'
        onClick={onClick}
      >
        <span className='min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-ui font-medium'>
          {result.title}
        </span>
        <span className='shrink-0 whitespace-nowrap rounded bg-surface px-2 py-1 font-[var(--font-ui)] text-[var(--font-size-caption-lg)] text-color-secondary'>
          {result.type}
        </span>
      </Link>
    </li>
  );
};
