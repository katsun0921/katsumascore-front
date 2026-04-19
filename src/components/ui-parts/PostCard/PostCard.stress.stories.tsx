import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCard } from './PostCard';
import type { Post } from '@/types/post';

const meta = {
  title: 'Ui-Parts/PostCard/Stress',
  component: PostCard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PostCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const basePost: Post = {
  id: 'stress-base',
  slug: '/posts/stress-test',
  title: 'ベースタイトル',
  excerpt: '通常の概要テキスト。',
  image: '/images/mock-image.webp',
  publishedAt: '2026-04-01',
  category: '映画',
  score: 3,
};

export const ExtremelyLongTitle: Story = {
  name: '[Stress] ExtremelyLongTitle',
  args: {
    post: {
      ...basePost,
      id: 'stress-long-title',
      title:
        '劇場版『機動戦士ガンダム ジークアクス』はなぜここまで観客の感情を揺さぶるのかを、脚本・演出・音響設計・カメラワーク・キャラクター造形のすべての積み重ねという観点から、公開初週に劇場で体感したうえで丁寧に読み解いてみる長大レビュー【ネタバレあり】',
      excerpt:
        '200文字を超えるような非常に長い概要テキストがここに入ります。実際の運用でも記事の概要が長くなることは十分に考えられるため、この文字量でレイアウトが崩れないことを確認します。段落の折り返し・行間・カード高さの変化に注目してください。レビュー本文では演出の細部に踏み込み、音楽・照明・間の取り方まで言及しています。',
    },
  },
};

export const ExtremelyLongTitleNoImage: Story = {
  name: '[Stress] ExtremelyLongTitle + NoImage',
  args: {
    post: {
      ...basePost,
      id: 'stress-long-title-no-image',
      image: null,
      title:
        '映像化不可能と言われた原作を映像化した監督の意図とアニメーション技術の限界への挑戦、そして世界市場への訴求を同時に達成した作品として後世に語り継がれるであろう傑作についての包括的批評【全8話完走レビュー・ネタバレ全開】',
      excerpt: '画像なし＋超長タイトルの組み合わせストレステスト。',
    },
  },
};

export const NoImage: Story = {
  name: '[Stress] NoImage',
  args: {
    post: {
      ...basePost,
      id: 'stress-no-image',
      image: null,
      title: 'アイキャッチ画像が存在しない記事のカード表示確認',
      excerpt: 'fallbackブロックが正しく表示され、カードの高さが正常であることを確認します。',
    },
  },
};

export const NoCategory: Story = {
  name: '[Stress] NoCategory',
  args: {
    post: {
      ...basePost,
      id: 'stress-no-category',
      category: undefined,
      title: 'カテゴリーが設定されていない記事',
      excerpt: 'カテゴリーフィールドが undefined の場合のレイアウト崩れがないことを確認します。',
    },
  },
};

export const NoScore: Story = {
  name: '[Stress] NoScore',
  args: {
    post: {
      ...basePost,
      id: 'stress-no-score',
      score: undefined,
      title: 'スコアが未設定の記事',
      excerpt: 'score が undefined の場合にスコア表示領域が消えてもレイアウトが崩れないことを確認します。',
    },
  },
};

export const MixedMeta: Story = {
  name: '[Stress] MixedMeta (all optional fields missing)',
  args: {
    post: {
      id: 'stress-mixed-meta',
      slug: '/posts/stress-mixed-meta',
      title: '任意フィールドがすべて欠落した記事',
      excerpt: 'category・score・image がすべて undefined / null の最低限データ状態を再現します。',
      image: null,
      publishedAt: '2026-01-01',
    },
  },
};

export const EmptyStrings: Story = {
  name: '[Stress] EmptyStrings (title="" excerpt="")',
  args: {
    post: {
      ...basePost,
      id: 'stress-empty-strings',
      title: '',
      excerpt: '',
    },
  },
};

export const WhitespaceOnlyTitle: Story = {
  name: '[Stress] WhitespaceOnlyTitle',
  args: {
    post: {
      ...basePost,
      id: 'stress-whitespace',
      title: '     　　　',
      excerpt: '　　　　　　',
    },
  },
};

export const VeryShortContent: Story = {
  name: '[Stress] VeryShortContent (1-char title)',
  args: {
    post: {
      ...basePost,
      id: 'stress-short',
      title: '映',
      excerpt: '短。',
    },
  },
};
