import type { Post } from "./post";

export type FranchiseTimelineEntry = {
  year: string;
  content: string;
};

export type FranchiseHighlight = {
  title: string;
  description: string;
};

export type FranchiseRelatedLink = {
  label: string;
  url: string;
};

export type FranchiseHeroImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

/** franchise タクソノミーターム + ACF フィールドを正規化したアプリ型。 */
export type Franchise = {
  id: number;
  slug: string;
  /** ACF `title_override` があればそちらを優先し、なければ taxonomy の `name` */
  title: string;
  description: string;
  catchCopy: string;
  heroImage: FranchiseHeroImage | null;
  startYear: number | null;
  endYear: number | null;
  originalAuthor: string;
  productionCompany: string;
  displayOrder: "asc" | "desc";
  showTimeline: boolean;
  showScore: boolean;
  timeline: FranchiseTimelineEntry[];
  highlights: FranchiseHighlight[];
  relatedLinks: FranchiseRelatedLink[];
  /** この franchise に属する投稿一覧 */
  posts: Post[];
};
