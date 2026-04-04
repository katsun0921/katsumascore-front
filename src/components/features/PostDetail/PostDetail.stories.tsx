import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostDetail } from './PostDetail';
import {
  mockPost,
  mockPostNoImage,
  mockPosts,
  mockPostContent,
} from '@/components/features/post/mocks/post';

const basePost = {
  ...mockPost,
  content: mockPostContent.content,
};

const meta = {
  title: 'Features/Post/PostDetail',
  component: PostDetail,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// What it tests: standard article page with all fields present
// ---------------------------------------------------------------------------
export const Default: Story = {
  args: {
    post: basePost,
  },
};

// ---------------------------------------------------------------------------
// LongContent
// What it tests: rich content with multiple heading levels, blockquote, list
// Verifies PostContent handles complex WordPress-generated HTML correctly
// ---------------------------------------------------------------------------
export const LongContent: Story = {
  args: {
    post: {
      ...basePost,
      title:
        '脚本・演出・音楽・キャストのすべてが噛み合った奇跡的な一作：長尺コンテンツで記事本文の折り返し・見出し・リストの表示を確認する【完全批評】',
      content: `
        <h2>作品の背景</h2>
        <p>この作品が生まれた背景には、制作チームの長年にわたるリサーチと準備がある。特に脚本段階での試行錯誤は、最終的な作品の密度に直結している。</p>
        <p><strong>長回し</strong>を多用した演出が、観客に独特の緊張感を与えている。また、<a href="#">外部リンク</a>のスタイルも確認できる。</p>
        <blockquote>
          <p>「カメラは真実を映す鏡ではなく、真実を構築する道具だ」— 監督インタビューより</p>
        </blockquote>
        <h3>カメラワーク</h3>
        <p>ハンドヘルドカメラの揺れが、登場人物の不安定な心理状態を的確に表現している。</p>
        <ul>
          <li>移動撮影の多用</li>
          <li>クローズアップの戦略的配置</li>
          <li>長回しによる時間の連続性の強調</li>
        </ul>
        <h3>音楽設計</h3>
        <p>サウンドトラックは最小限に抑えられており、環境音が物語を牽引する場面が多い。</p>
        <h2>総評</h2>
        <p>この作品は2026年を代表する一作として、長く語り継がれるだろう。スコアは満点の5を与えるに値する。</p>
        <pre><code>// コードブロックのスタイルも確認
const score = 5;
console.log(\`スコア: \${score}\`);</code></pre>
      `,
    },
  },
};

// ---------------------------------------------------------------------------
// NoImage
// What it tests: article without a featured image
// Verifies the header and meta still render correctly without image context
// ---------------------------------------------------------------------------
export const NoImage: Story = {
  args: {
    post: {
      ...mockPostNoImage,
      content: mockPostContent.content,
    },
  },
};

// ---------------------------------------------------------------------------
// WithRelatedPosts
// What it tests: full page layout with related posts grid appended
// Verifies that PostList integration does not break the article layout
// ---------------------------------------------------------------------------
export const WithRelatedPosts: Story = {
  args: {
    post: basePost,
    relatedPosts: mockPosts,
  },
};
