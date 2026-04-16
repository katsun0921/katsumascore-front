import type { Post } from '@/components/features/Post/types/post';
import type { HomeHeroProps } from '../HomeHero/HomeHero';
import type { VodFinderItem } from '../HomeVodFinder/HomeVodFinder';
import type { SeasonItem } from '../HomeSeasonReview/HomeSeasonReview';
import type { RecommendBlock } from '../HomeRecommend/HomeRecommend';
import type { FeaturedItem } from '../HomeFeatured/HomeFeatured';

export const mockHeroData: HomeHeroProps = {
  title: 'ナイブズ・アウト：ウェイク・アップ・デッドマン',
  subtitle: '信仰と罪が交差する密室、名探偵は不可能を暴けるか。ライアン・ジョンソン監督が紡ぐ三部作の完結編。',
  score: 3.5,
  rank: 'A',
  href: '/posts/knives-out-3',
  vods: ['netflix', 'amazon'],
};

export const mockRankingPosts: Post[] = [
  {
    id: '1',
    slug: '/posts/kpop-girls',
    title: 'KPOPガールズ! デーモン・ハンターズ',
    excerpt: '',
    image: null,
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
    image: null,
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
    image: null,
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
    image: null,
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
    image: null,
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
    image: null,
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
    image: null,
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
    image: null,
    publishedAt: '2025-03-28',
    category: '映画',
    score: 2.8,
  },
  {
    id: '13',
    slug: '/posts/knives-out-3',
    title: 'ナイブズ・アウト',
    excerpt: '',
    image: null,
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
    image: null,
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
    image: null,
    publishedAt: '2025-01-10',
    category: '劇場版アニメ',
    score: 4.2,
  },
  {
    id: '21',
    slug: '/posts/kaguyahime',
    title: '超かぐや姫！',
    excerpt: '',
    image: null,
    publishedAt: '2025-02-14',
    category: '劇場版アニメ',
    score: 3.8,
  },
  {
    id: '22',
    slug: '/posts/hathaway-short',
    title: '閃光のハサウェイ',
    excerpt: '',
    image: null,
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
    image: null,
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
    image: null,
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
    image: null,
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
    image: null,
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
      { id: '40', slug: '/posts/voyager', title: 'ヴォイジャー', excerpt: '', image: null, publishedAt: '2021-05-01', category: '映画', score: 2.5 },
      { id: '41', slug: '/posts/companion', title: 'コンパニオン', excerpt: '', image: null, publishedAt: '2025-01-01', category: '映画', score: 3.3, vods: ['amazon'] },
      { id: '42', slug: '/posts/warmachine', title: 'ウォー・マシーン', excerpt: '', image: null, publishedAt: '2017-05-26', category: '映画', score: 3.0, vods: ['netflix'] },
      { id: '43', slug: '/posts/avatar', title: 'アバター', excerpt: '', image: null, publishedAt: '2009-12-18', category: '映画', score: 3.0 },
    ],
  },
  {
    tag: 'ホラー',
    seeAllHref: '/genre/horror',
    posts: [
      { id: '50', slug: '/posts/rec', title: 'REC レック (2007)', excerpt: '', image: null, publishedAt: '2007-11-23', category: '映画', score: 3.5 },
      { id: '51', slug: '/posts/m3gan', title: 'M3GAN／ミーガン 2.0', excerpt: '', image: null, publishedAt: '2025-04-01', category: '映画', score: 3.3, vods: ['amazon'] },
      { id: '52', slug: '/posts/rec2', title: 'レック2 (2009)', excerpt: '', image: null, publishedAt: '2009-10-09', category: '映画', score: 3.0 },
      { id: '53', slug: '/posts/grave-encounters', title: 'グレイヴ・エンカウンターズ', excerpt: '', image: null, publishedAt: '2011-09-09', category: '映画', score: 2.5 },
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
