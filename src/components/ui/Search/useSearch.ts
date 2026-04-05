import { useState, useEffect, useCallback } from 'react';

export type SearchResult = {
  id: number;
  title: string;
  type: '映画' | 'ドラマ';
  thumbnail?: string;
  href: string;
};

// Replace with WordPress REST API call later
// e.g. GET /wp-json/wp/v2/posts?search={query}&per_page=5
const mockResults: SearchResult[] = [
  { id: 1, title: 'イコライザー', type: '映画', href: '/posts/equalizer' },
  { id: 2, title: 'イコライザー2', type: '映画', href: '/posts/equalizer-2' },
  { id: 3, title: 'ゴジラ-1.0', type: '映画', href: '/posts/godzilla-minus-one' },
  { id: 4, title: 'ストレンジャー・シングス', type: 'ドラマ', href: '/posts/stranger-things' },
  { id: 5, title: 'ゲーム・オブ・スローンズ', type: 'ドラマ', href: '/posts/got' },
  { id: 6, title: 'トップガン マーヴェリック', type: '映画', href: '/posts/top-gun-maverick' },
  { id: 7, title: 'ミッション：インポッシブル', type: '映画', href: '/posts/mission-impossible' },
  { id: 8, title: 'ブレイキング・バッド', type: 'ドラマ', href: '/posts/breaking-bad' },
];

const searchMock = async (query: string): Promise<SearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockResults.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );
};

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      const data = await searchMock(query);
      setResults(data);
      setIsOpen(true);
      setActiveIndex(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const moveDown = useCallback((total: number) => {
    setActiveIndex(prev => Math.min(prev + 1, total - 1));
  }, []);

  const moveUp = useCallback(() => {
    setActiveIndex(prev => Math.max(prev - 1, -1));
  }, []);

  const activeResult = results[activeIndex] ?? null;

  return {
    query,
    setQuery,
    results,
    isOpen,
    activeIndex,
    activeResult,
    moveDown,
    moveUp,
    close,
  };
};
