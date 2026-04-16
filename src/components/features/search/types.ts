export type SearchResult = {
  id: number;
  title: string;
  type: '映画' | 'ドラマ';
  thumbnail?: string;
  href: string;
};
