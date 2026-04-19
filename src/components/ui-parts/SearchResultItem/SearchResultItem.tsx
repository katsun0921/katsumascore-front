import Link from 'next/link';
import type { SearchResult } from '@/components/features/search';

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
        className='flex items-center justify-between gap-3 px-3 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] hover:opacity-100'
        onClick={onClick}
      >
        <span className='min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--font-size-ui-lg)] font-medium'>
          {result.title}
        </span>
        <span className='shrink-0 whitespace-nowrap rounded bg-[var(--color-surface-muted)] px-2 py-1 font-[var(--font-ui)] text-[var(--font-size-caption-lg)] text-[var(--color-text-secondary)]'>
          {result.type}
        </span>
      </Link>
    </li>
  );
};
