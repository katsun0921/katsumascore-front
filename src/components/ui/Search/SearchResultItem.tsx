import React from 'react';
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
      role="option"
      aria-selected={isActive}
      className={`search__result-item${isActive ? ' search__result-item--active' : ''}`}
    >
      <Link href={result.href} className="search__result-link" onClick={onClick}>
        <span className="search__result-title">{result.title}</span>
        <span className="search__result-type">{result.type}</span>
      </Link>
    </li>
  );
};
