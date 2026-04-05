import React, { useRef, useEffect, useId } from 'react';
import { useSearch } from './useSearch';
import { SearchResultItem } from './SearchResultItem';
import './Search.scss';

type Props = {
  onNavigate?: (href: string) => void;
  className?: string;
};

export const Search = ({ onNavigate, className }: Props) => {
  const { query, setQuery, results, isOpen, activeIndex, activeResult, moveDown, moveUp, close } =
    useSearch();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const getItemId = (index: number) => `${listboxId}-item-${index}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveDown(results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveUp();
        break;
      case 'Enter':
        e.preventDefault();
        if (activeResult && onNavigate) {
          onNavigate(activeResult.href);
          close();
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        inputRef.current?.blur();
        break;
    }
  };

  const showDropdown = isOpen && results.length > 0;

  return (
    <div className={`search${className ? ` ${className}` : ''}`} ref={containerRef}>
      <input
        ref={inputRef}
        type="search"
        className="search__input"
        placeholder="タイトルで検索..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? getItemId(activeIndex) : undefined}
        autoComplete="off"
        spellCheck={false}
      />
      {showDropdown && (
        <ul id={listboxId} className="search__results" role="listbox">
          {results.map((result, index) => (
            <SearchResultItem
              key={result.id}
              result={result}
              isActive={index === activeIndex}
              id={getItemId(index)}
              onClick={() => {
                close();
                inputRef.current?.blur();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
