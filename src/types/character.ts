export type Character = {
  id: number;
  slug: string;
  name: string;
  /** 0 = ルート（marvel-characters 等） */
  parent: number;
  parentSlug?: string;
};
