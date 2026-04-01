export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia": [{ source_url: string }];
  };
  acf?: {
    review_score?: 1 | 2 | 3 | 4 | 5;
    title_jp?: string;
    title_en?: string;
    acf_summary_group?: {
      summary_jp?: string;
      summary_en?: string;
    };
    actors_filed?: { name: string; role?: string }[];
    release_date?: string; // Ymd形式
    good_point_filed?: string;
    official_url?: string;
    official_sns?: string;
    streaming_vod_netflix?: boolean;
    streaming_vod_amazon?: boolean;
    streaming_vod_unext?: boolean;
    is_cinema_showing?: boolean;
  };
}

export interface WPCategory {
  id: number;
  slug: string;
  name: string;
  count: number;
  parent: number;
}

export type ScoreRank = "SS" | "S" | "A" | "B" | "C";

export function getScoreRank(score: 1 | 2 | 3 | 4 | 5): ScoreRank {
  if (score === 5) return "SS";
  if (score === 4) return "S";
  if (score === 3) return "A";
  if (score === 2) return "B";
  return "C";
}
