import type { Post } from '@/types/post';
import type { HomeHeroProps } from '@/components/features/HomeHero';
import type { VodFinderItem } from '@/components/ui-home/HomeVodFinder';
import type { SeasonItem } from '@/components/ui-home/HomeSeasonReview';
import type { RecommendBlock } from '@/components/ui-home/HomeRecommend';
import type { FeaturedItem } from '@/components/ui-home/HomeFeatured';

export const mockHeroData: HomeHeroProps = {
  slides: [
    {
      title: 'DUNE PART TWO',
      copy: '震えるほどの、熱狂を。',
      score: 9.2,
      rank: 'SS',
      href: '/posts/dune-part-two',
      image: 'https://placehold.jp/1000x1400.png',
    },
    {
      title: 'OPPENHEIMER',
      copy: '愛が、すべてを壊す。',
      score: 8.5,
      rank: 'S',
      href: '/posts/oppenheimer',
      image: 'https://placehold.jp/3d4070/ffffff/1000x1400.png',
    },
    {
      title: 'PERFECT DAYS',
      copy: 'その結末に、涙する。',
      score: 7.8,
      rank: 'A',
      href: '/posts/perfect-days',
      image: 'https://placehold.jp/dd6699/ffffff/1000x1400.png',
    },
  ],
};

export const mockRankingPosts: Post[] = [
  {
    id: '1',
    slug: '/posts/kpop-girls',
    title: 'KPOPガールズ! デーモン・ハンターズ',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-01-10',
    category: 'アニメ',
    score: 4.2,
    year: 2025,
  },
  {
    id: '2',
    slug: '/posts/one-battle',
    title: 'ワン・バトル・アフター・アナザー',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-03-15',
    category: '映画',
    score: 3.5,
    year: 2025,
  },
  {
    id: '3',
    slug: '/posts/hathaway',
    title: '閃光のハサウェイ キルケーの魔女',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-02-20',
    category: 'アニメ',
    score: 3.4,
    year: 2025,
  },
  {
    id: '4',
    slug: '/posts/equalizer',
    title: 'イコライザー (2014)',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2024-11-05',
    category: '映画',
    score: 3.3,
    year: 2014,
  },
  {
    id: '5',
    slug: '/posts/troll',
    title: "Netflix『トロール』",
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2024-09-22',
    category: '映画',
    score: 3.2,
    year: 2022,
  },
];

export const mockLatestPosts: Post[] = [
  {
    id: '10',
    slug: '/posts/equalizer-2014',
    title: 'イコライザー (2014)',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2024-11-05',
    category: '映画',
    score: 3.3,
    vods: ['netflix', 'amazon'],
  },
  {
    id: '11',
    slug: '/posts/m3gan',
    title: 'M3GAN／ミーガン 2.0',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-04-01',
    category: '映画',
    score: 3.3,
    vods: ['amazon'],
  },
  {
    id: '12',
    slug: '/posts/troll2',
    title: 'トロール２ (2025)',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-03-28',
    category: '映画',
    score: 2.8,
  },
  {
    id: '13',
    slug: '/posts/knives-out-3',
    title: 'ナイブズ・アウト',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-03-10',
    category: '映画',
    score: 3.5,
    vods: ['netflix', 'amazon'],
  },
  {
    id: '14',
    slug: '/posts/troll-netflix',
    title: "Netflix『トロール』",
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2024-09-22',
    category: '映画',
    score: 3.2,
    vods: ['netflix'],
  },
];

export const mockAnimePosts: Post[] = [
  {
    id: '20',
    slug: '/posts/kpop-girls',
    title: 'KPOPガールズ!',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-01-10',
    category: '劇場版アニメ',
    score: 4.2,
  },
  {
    id: '21',
    slug: '/posts/kaguyahime',
    title: '超かぐや姫！',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-02-14',
    category: '劇場版アニメ',
    score: 3.8,
  },
  {
    id: '22',
    slug: '/posts/hathaway-short',
    title: '閃光のハサウェイ',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-02-20',
    category: '劇場版アニメ',
    score: 3.5,
  },
];

export const mockHighScorePosts: Post[] = [
  {
    id: '30',
    slug: '/posts/kpop-girls',
    title: 'KPOPガールズ!',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-01-10',
    category: 'アニメ',
    score: 4.2,
    vods: ['netflix'],
  },
  {
    id: '31',
    slug: '/posts/kaguyahime',
    title: '超かぐや姫！',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-02-14',
    category: 'アニメ',
    score: 3.8,
    vods: ['amazon', 'unext'],
  },
  {
    id: '32',
    slug: '/posts/one-battle',
    title: 'ワン・バトル・アフター・アナザー',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-03-15',
    category: '映画',
    score: 3.5,
    vods: ['netflix', 'amazon'],
  },
  {
    id: '33',
    slug: '/posts/hathaway-short',
    title: '閃光のハサウェイ',
    excerpt: '',
    image: '/images/mock-image.webp',
    publishedAt: '2025-02-20',
    category: 'アニメ',
    score: 3.5,
    vods: ['netflix'],
  },
];

export const mockRecommendBlocks: RecommendBlock[] = [
  {
    tag: 'SF',
    seeAllHref: '/genre/sf',
    posts: [
      { id: '40', slug: '/posts/voyager', title: 'ヴォイジャー', excerpt: '', image: '/images/mock-image.webp', publishedAt: '2021-05-01', category: '映画', score: 2.5 },
      { id: '41', slug: '/posts/companion', title: 'コンパニオン', excerpt: '', image: '/images/mock-image.webp', publishedAt: '2025-01-01', category: '映画', score: 3.3, vods: ['amazon'] },
      { id: '42', slug: '/posts/warmachine', title: 'ウォー・マシーン', excerpt: '', image: '/images/mock-image.webp', publishedAt: '2017-05-26', category: '映画', score: 3.0, vods: ['netflix'] },
      { id: '43', slug: '/posts/avatar', title: 'アバター', excerpt: '', image: '/images/mock-image.webp', publishedAt: '2009-12-18', category: '映画', score: 3.0 },
    ],
  },
  {
    tag: 'ホラー',
    seeAllHref: '/genre/horror',
    posts: [
      { id: '50', slug: '/posts/rec', title: 'REC レック (2007)', excerpt: '', image: '/images/mock-image.webp', publishedAt: '2007-11-23', category: '映画', score: 3.5 },
      { id: '51', slug: '/posts/m3gan', title: 'M3GAN／ミーガン 2.0', excerpt: '', image: '/images/mock-image.webp', publishedAt: '2025-04-01', category: '映画', score: 3.3, vods: ['amazon'] },
      { id: '52', slug: '/posts/rec2', title: 'レック2 (2009)', excerpt: '', image: '/images/mock-image.webp', publishedAt: '2009-10-09', category: '映画', score: 3.0 },
      { id: '53', slug: '/posts/grave-encounters', title: 'グレイヴ・エンカウンターズ', excerpt: '', image: '/images/mock-image.webp', publishedAt: '2011-09-09', category: '映画', score: 2.5 },
    ],
  },
];

export const mockVodFinderItems: VodFinderItem[] = [
  { vod: 'netflix', count: 12, href: '/vod/netflix' },
  { vod: 'amazon', count: 8, href: '/vod/amazon' },
  { vod: 'unext', count: 6, href: '/vod/unext' },
  { vod: 'hulu', count: 4, href: '/vod/hulu' },
];

export const mockSeasonItems: SeasonItem[] = [
  { label: '冬', period: '2026年 1-3月', href: '/season/2026-winter', isCurrent: true },
  { label: '秋', period: '2025年 10-12月', href: '/season/2025-autumn' },
  { label: '夏', period: '2025年 7-9月', href: '/season/2025-summer' },
  { label: '春', period: '2025年 4-6月', href: '/season/2025-spring' },
];

export const mockFeaturedItems: FeaturedItem[] = [
  {
    label: 'SPECIAL',
    title: 'シーズンのアニメとドラマの一口レビュー',
    description: '2026年冬シーズン 最新更新',
    href: '/special/season-review',
    isPrimary: true,
  },
  {
    label: 'SPECIAL',
    title: 'トロール シリーズ完全ガイド',
    description: '北欧神話 × 怪獣映画の世界',
    href: '/special/troll-series',
  },
];
