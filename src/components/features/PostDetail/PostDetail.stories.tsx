import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostDetail } from './PostDetail'
import { mockPost, mockPostNoImage, mockPosts, mockPostContent } from '@/components/features/post/mocks/post'
import type { PostDetailData } from './PostDetail.types'

// ---------------------------------------------------------------------------
// Base fixture — single.php の全フィールドを含む完全データ
// ---------------------------------------------------------------------------
const basePost: PostDetailData = {
  ...mockPost,
  titleEn: 'A Bouquet of Clumsy Words',
  updatedAt: '2026-04-03',
  content: mockPostContent.content,
  excerpt: '登場人物の距離感や東京の空気を追いながら、恋愛映画としての切なさと現代性を丁寧に読み解くためのレビューです。',
  videoCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allowfullscreen></iframe>',
  goodPoints: [
    '菅田将暉と有村架純の自然な演技',
    '東京のリアルな空気感',
    '共感度の高いセリフ',
  ],
  summary: {
    text: '就活もバイトもせず映画と音楽と本に埋もれて生きてきた麦と絹。偶然出会った2人は意気投合し、付き合い始める。',
    refUrl: 'https://example.com',
    refLabel: '公式サイト',
  },
  basicInfo: {
    titleEn: 'A Bouquet of Clumsy Words',
    officialUrl: 'https://hanataba-movie.com',
    copyright: '©2021「花束みたいな恋をした」製作委員会',
    releaseDate: '20210129',
    officialSns: {
      x: { link: 'https://x.com/hanataba_movie' },
      instagram: { link: 'https://instagram.com/hanataba_movie' },
    },
    filmStudios: [
      { name: 'Sony Pictures Entertainment', href: '/film-studio/sony' },
    ],
    productionStudios: [
      { name: 'アミューズ', href: '/production-studio/amuse' },
    ],
  },
  credits: [
    {
      role: '監督',
      names: ['土井裕泰'],
    },
  ],
  actors: [
    {
      character: '山音麦',
      actorName: '菅田将暉',
      description: '就活をせず映画・音楽・本に埋もれて生きる青年。',
      otherWorks: [
        { title: '銀魂', href: '/posts/gintama', character: '坂田銀時' },
      ],
    },
    {
      character: '八谷絹',
      actorName: '有村架純',
      description: '麦と同じく文化的なものを愛する女性。',
    },
  ],
  reviewSiteScores: {
    sites: [
      { label: 'Filmarks', score: 3.9, maxScore: 5, url: 'https://filmarks.com' },
      { label: 'Yahoo!映画', score: 4.1, maxScore: 5, url: 'https://movies.yahoo.co.jp' },
      { label: 'Rotten Tomatoes', score: 85, maxScore: 100, url: 'https://rottentomatoes.com', audienceScore: 90 },
    ],
    publishedDate: '2026-04-01',
  },
  vodIntroduction: {
    titleJp: '花束みたいな恋をした',
    titleEn: 'A Bouquet of Clumsy Words',
    writtenFrom: {
      type: 'vod',
      vodName: 'Amazon Prime Video',
      vodUrl: 'https://www.amazon.co.jp/prime-video',
      vodImageUrl: '/images/mock-image.webp',
    },
    publishedAt: '2026-04-01',
    relatedPosts: mockPosts.slice(0, 3),
  },
  streamingVods: [
    { service: 'netflix', url: 'https://netflix.com', isPaid: true },
    { service: 'amazon', url: 'https://amazon.co.jp/prime-video' },
  ],
  rentalServices: [
    { service: 'tsutaya', url: 'https://tsutaya.com' },
  ],
  relationPosts: [
    { id: 1, title: '関連作品A', href: '/posts/related-a', imageUrl: '/images/mock-image.webp' },
    { id: 2, title: '関連作品B', href: '/posts/related-b', imageUrl: '/images/mock-image.webp' },
    { id: 3, title: '関連作品C', href: '/posts/related-c' },
  ],
  postsGroups: [
    {
      heading: 'こちらもおすすめです！',
      posts: mockPosts.slice(0, 3),
    },
    {
      heading: '恋愛映画もおすすめです！',
      posts: mockPosts.slice(0, 2),
    },
  ],
  shareUrl: 'https://example.com/posts/hanataba-review',
}

const meta = {
  title: 'Features/Post/PostDetail',
  component: PostDetail,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostDetail>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default — 全フィールドあり（single.php の完全再現）
// ---------------------------------------------------------------------------
export const Default: Story = {
  args: { post: basePost },
}

// ---------------------------------------------------------------------------
// EnLocale — 英語ロケール
// ---------------------------------------------------------------------------
export const EnLocale: Story = {
  args: {
    post: basePost,
    locale: 'en',
  },
}

// ---------------------------------------------------------------------------
// NoImage — アイキャッチなし
// ---------------------------------------------------------------------------
export const NoImage: Story = {
  args: {
    post: {
      ...basePost,
      ...mockPostNoImage,
      content: mockPostContent.content,
    },
  },
}

// ---------------------------------------------------------------------------
// CinemaShowing — 劇場公開中（VOD・レンタル非表示）
// ---------------------------------------------------------------------------
export const CinemaShowing: Story = {
  args: {
    post: {
      ...basePost,
      isCinemaShowing: true,
      vodIntroduction: {
        titleJp: '機動戦士ガンダム ジークアクス',
        writtenFrom: {
          type: 'cinema',
          isShowing: true,
          cinemaUrl: 'https://example.com/cinema',
        },
        publishedAt: '2026-04-01',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// MinimalData — スコア・ACF系フィールドがすべて空（欠損系）
// ---------------------------------------------------------------------------
export const MinimalData: Story = {
  args: {
    post: {
      ...mockPost,
      content: mockPostContent.content,
    },
  },
}

// ---------------------------------------------------------------------------
// LongTitle — タイトルが極端に長い
// ---------------------------------------------------------------------------
export const LongTitle: Story = {
  args: {
    post: {
      ...basePost,
      title: '劇場版『機動戦士ガンダム ジークアクス』はなぜここまで観客の感情を揺さぶるのかを、演出と脚本と音響設計の積み重ねからじっくり読み解いてみる',
    },
  },
}

// ---------------------------------------------------------------------------
// ManyActors — キャストが多い（Chaos）
// ---------------------------------------------------------------------------
export const ManyActors: Story = {
  args: {
    post: {
      ...basePost,
      actors: Array.from({ length: 10 }, (_, i) => ({
        character: `キャラクター${i + 1}`,
        actorName: `俳優名 ${i + 1}`,
        description: i % 2 === 0 ? `キャラクター${i + 1}の説明文。長めのテキストが入ることもある。` : undefined,
      })),
    },
  },
}

// ---------------------------------------------------------------------------
// ManyPostsGroups — 関連投稿グループが多い（Chaos）
// ---------------------------------------------------------------------------
export const ManyPostsGroups: Story = {
  args: {
    post: {
      ...basePost,
      postsGroups: Array.from({ length: 5 }, (_, i) => ({
        heading: `グループ ${i + 1} のおすすめ作品`,
        description: i % 2 === 0 ? 'このグループは説明文付きです。' : undefined,
        posts: mockPosts.slice(0, 3),
      })),
    },
  },
}
