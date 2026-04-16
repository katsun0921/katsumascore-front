import type { Meta, StoryObj } from '@storybook/react'
import { PageList } from './PageList'
import type { WPPost } from '@/types/wordpress'

// -----------------------------------------------
// モックデータ
// -----------------------------------------------

const makePost = (id: number, overrides: Partial<WPPost> = {}): WPPost => ({
  id,
  slug: `post-${id}`,
  title: { rendered: `記事タイトル ${id}` },
  content: { rendered: '<p>本文テキストです。</p>' },
  excerpt: { rendered: '<p>抜粋テキストです。</p>' },
  date: '2024-03-15T00:00:00',
  featured_media: 0,
  acf: {
    title_jp: `日本語タイトル ${id}`,
    title_en: `English Title ${id}`,
    review_score: (((id - 1) % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    release_date: `20240${String(id % 12 || 1).padStart(2, '0')}15`,
  },
  ...overrides,
})

const makePostWithThumbnail = (id: number): WPPost => ({
  ...makePost(id),
  featured_media: id,
  _embedded: {
    'wp:featuredmedia': [
      {
        source_url: `https://placehold.co/512x512/290f48/ffffff?text=Post+${id}`,
        alt_text: `サムネイル ${id}`,
      },
    ],
  },
})

const posts9 = Array.from({ length: 9 }, (_, i) => makePostWithThumbnail(i + 1))
const postsNoImage = Array.from({ length: 6 }, (_, i) => makePost(i + 1))

// -----------------------------------------------
// Meta
// -----------------------------------------------

const meta: Meta<typeof PageList> = {
  title: 'Templates/PageList',
  component: PageList,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    locale: {
      control: 'select',
      options: ['ja', 'en'],
    },
    currentPage: {
      control: { type: 'number', min: 1 },
    },
    totalPages: {
      control: { type: 'number', min: 1 },
    },
  },
}

export default meta
type Story = StoryObj<typeof PageList>

// -----------------------------------------------
// Stories
// -----------------------------------------------

/** 標準の記事一覧（日本語・1ページ） */
export const Default: Story = {
  args: {
    posts: posts9,
    currentPage: 1,
    totalPages: 1,
    locale: 'ja',
  },
}

/** カテゴリータイトル付き */
export const WithTitle: Story = {
  args: {
    posts: posts9,
    currentPage: 1,
    totalPages: 1,
    locale: 'ja',
    title: 'アニメレビュー',
  },
}

/** 複数ページ（ページネーション表示） */
export const MultiPage: Story = {
  args: {
    posts: posts9,
    currentPage: 3,
    totalPages: 7,
    locale: 'ja',
    title: 'ドラマレビュー',
  },
}

/** 英語ロケール */
export const English: Story = {
  args: {
    posts: posts9,
    currentPage: 1,
    totalPages: 3,
    locale: 'en',
    title: 'Anime Reviews',
  },
}

/** サムネイルなし */
export const NoImage: Story = {
  args: {
    posts: postsNoImage,
    currentPage: 1,
    totalPages: 1,
    locale: 'ja',
    title: 'サムネイルなし',
  },
}

/** 記事が存在しない場合（空状態） */
export const Empty: Story = {
  args: {
    posts: [],
    currentPage: 1,
    totalPages: 1,
    locale: 'ja',
  },
}
