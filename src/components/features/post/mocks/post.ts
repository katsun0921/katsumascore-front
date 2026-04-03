import type { Post, PostContentData } from '@/components/features/post/types/post';

export const mockPost: Post = {
  id: 'post-001',
  slug: '/posts/hanataba-review',
  title: '映画『花束みたいな恋をした』の余韻を静かにほどくレビュー',
  excerpt:
    '登場人物の距離感や東京の空気を追いながら、恋愛映画としての切なさと現代性を丁寧に読み解くためのレビューです。',
  image: '/images/dummy-540X400.webp',
  publishedAt: '2026-04-01',
  category: '映画',
  score: 4.5,
};

export const mockPostLongTitle: Post = {
  ...mockPost,
  id: 'post-002',
  slug: '/posts/gquuuuuux-deep-dive',
  title:
    '劇場版『機動戦士ガンダム ジークアクス』はなぜここまで観客の感情を揺さぶるのかを、演出と脚本と音響設計の積み重ねからじっくり読み解いてみる',
  publishedAt: '2026-04-02',
};

export const mockPostNoImage: Post = {
  ...mockPost,
  id: 'post-003',
  slug: '/posts/spring-drama-first-look',
  title: '春ドラマ序盤レビュー 今年の注目作を3本に絞って比較する',
  image: null,
  publishedAt: '2026-04-03',
};

export const mockPosts: Post[] = [
  mockPost,
  mockPostLongTitle,
  mockPostNoImage,
  {
    ...mockPost,
    id: 'post-004',
    slug: '/posts/frieren-quiet-power',
    title: 'アニメ『葬送のフリーレン』の静かな強さ',
    publishedAt: '2026-04-04',
    score: 5,
    category: 'アニメ',
  },
];

export const mockPostContent: PostContentData = {
  content: `
    <h2>WordPress 記事本文のサンプル</h2>
    <p>これは WordPress 由来の HTML コンテンツを確認するためのサンプルです。</p>
    <p><strong>強調テキスト</strong>や<a href="https://example.com">リンク</a>の見え方も確認できます。</p>
    <blockquote>
      <p>引用ブロックの余白やタイポグラフィも Storybook 上で確認できます。</p>
    </blockquote>
  `,
};
