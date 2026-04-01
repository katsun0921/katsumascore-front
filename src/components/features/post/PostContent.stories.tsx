import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostContent } from './PostContent';

const meta: Meta<typeof PostContent> = {
  title: 'Post/PostContent',
  component: PostContent,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    content: `
      <p>これは基本的な段落の例です。WordPressのWYSIWYGエディタで作成されたコンテンツのスタイルを確認できます。</p>
      <p>複数の段落がある場合の表示も確認できます。適切な間隔が設定されているかチェックしましょう。</p>
    `,
  },
};

export const Headings: Story = {
  args: {
    content: `
      <h1>見出し1 (H1) - メインタイトル</h1>
      <p>見出し1の下の段落テキストです。</p>
      <h2>見出し2 (H2) - セクションタイトル</h2>
      <p>見出し2の下の段落テキストです。</p>
      <h3>見出し3 (H3) - サブセクションタイトル</h3>
      <p>見出し3の下の段落テキストです。</p>
      <h4>見出し4 (H4) - 小見出し</h4>
      <p>見出し4の下の段落テキストです。</p>
    `,
  },
};

export const Lists: Story = {
  args: {
    content: `
      <h3>順序なしリスト (ul)</h3>
      <ul>
        <li>リスト項目1</li>
        <li>リスト項目2</li>
        <li>リスト項目3
          <ul>
            <li>ネストしたリスト項目1</li>
            <li>ネストしたリスト項目2</li>
          </ul>
        </li>
      </ul>
      <h3>順序付きリスト (ol)</h3>
      <ol>
        <li>順序付き項目1</li>
        <li>順序付き項目2</li>
        <li>順序付き項目3
          <ol>
            <li>ネストした順序付き項目1</li>
            <li>ネストした順序付き項目2</li>
          </ol>
        </li>
      </ol>
    `,
  },
};

export const TextFormatting: Story = {
  args: {
    content: `
      <p>通常のテキストです。</p>
      <p><strong>太字（strong）のテキスト</strong>と<em>斜体（em）のテキスト</em>が混在しています。</p>
      <p><b>太字（b）のテキスト</b>と<i>斜体（i）のテキスト</i>も使用できます。</p>
      <p><u>下線付き（u）のテキスト</u>や<s>取り消し線（s）のテキスト</s>もあります。</p>
      <p><code>インラインコード（code）のテキスト</code>も表示できます。</p>
    `,
  },
};

export const Links: Story = {
  args: {
    content: `
      <p>これは<a href="https://example.com">外部リンク</a>の例です。</p>
      <p><a href="#internal">内部リンク</a>や<a href="mailto:test@example.com">メールリンク</a>も使用できます。</p>
      <p><a href="https://example.com" target="_blank" rel="noopener">新しいタブで開くリンク</a>の例です。</p>
    `,
  },
};

export const Blockquote: Story = {
  args: {
    content: `
      <p>通常の段落テキストです。</p>
      <blockquote>
        <p>これは引用文（blockquote）の例です。重要な内容や他のソースからの引用を表示する際に使用されます。</p>
        <p>引用文内でも複数の段落を使用できます。</p>
      </blockquote>
      <p>引用文の後の通常の段落テキストです。</p>
    `,
  },
};

export const Images: Story = {
  args: {
    content: `
      <p>画像の表示例です：</p>
      <img src="/images/dummy-540X400.webp" alt="サンプル画像" style="max-width: 100%; height: auto;" />
      <p>画像の下のテキストです。</p>
    `,
  },
};

export const CodeBlocks: Story = {
  args: {
    content: `
      <p>インラインコードの例：<code>console.log('Hello World')</code></p>
      <p>コードブロックの例：</p>
      <pre><code>function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));</code></pre>
      <p>コードブロックの後のテキストです。</p>
    `,
  },
};

export const ComplexContent: Story = {
  args: {
    content: `
      <h1>WordPress投稿コンテンツの完全な例</h1>
      <p>これは<strong>WordPressのWYSIWYGエディタ</strong>で作成されたコンテンツの<em>包括的な例</em>です。</p>
      <h2>見出し2 (H2)</h2>
      <p>見出し2の下の段落テキストです。</p>
      <h3>見出し3 (H3)</h3>
      <ul>
        <li>順序なしリスト項目1</li>
        <li>順序なしリスト項目2</li>
      </ul>
      <blockquote><p>「これは重要な引用文の例です。」</p></blockquote>
      <p>様々な<a href="https://example.com">リンク</a>を作成できます。</p>
      <hr />
      <img src="/images/dummy-540X400.webp" alt="サンプル画像" style="max-width: 100%; height: auto;" />
      <p>インラインコード：<code>const example = 'Hello World'</code></p>
    `,
  },
};

export const EmptyContent: Story = {
  args: {
    content: '',
  },
};

export const WithCustomClass: Story = {
  args: {
    content: `
      <p>カスタムクラスが適用されたコンテンツの例です。</p>
      <p>このコンテンツには追加のCSSクラスが適用されています。</p>
    `,
    className: 'custom-post-content',
  },
};
