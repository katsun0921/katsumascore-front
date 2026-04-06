import Link from 'next/link';
import type { SearchResult } from './useSearch';

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
      className={isActive ? 'bg-[var(--color-bg-muted)]' : ''}
    >
      <Link
        href={result.href}
        className='flex items-center justify-between px-[14px] py-[10px] gap-3 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] hover:opacity-100'
        onClick={onClick}
      >
        <span className='text-[0.875rem] font-medium flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>
          {result.title}
        </span>
        <span className='text-[0.75rem] font-[var(--font-ui)] text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] px-2 py-[2px] rounded shrink-0 whitespace-nowrap'>
          {result.type}
        </span>
      </Link>
    </li>
  );
};
