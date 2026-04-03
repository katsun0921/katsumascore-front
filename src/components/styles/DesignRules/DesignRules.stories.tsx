import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import './DesignRules.stories.scss'

type RuleGroup = {
  title: string
  description: string
  items: string[]
}

type TokenCard = {
  title: string
  token: string
  meaning: string
  example: string
}

const colorRules: RuleGroup[] = [
  {
    title: 'Color Rules',
    description: '色は役割で管理し、直接値ではなく token を経由して使います。',
    items: [
      'CTA / リンクは primary を使う',
      '背景は bg 系 token を使う',
      '本文は text 系 token を使う',
      'Score は専用 token で最優先に見せる',
      'accent は補助 UI に限定する',
    ],
  },
  {
    title: 'Forbidden',
    description: 'デザインの一貫性を崩しやすい指定は避けます。',
    items: [
      '直接カラーコードを書かない',
      'Tailwind のデフォルト色をそのまま使わない',
      '同一画面で強い色を複数競合させない',
    ],
  },
]

const typographyRules: RuleGroup[] = [
  {
    title: 'Japanese Typography',
    description: '本文、見出し、アクセントで役割を分離します。',
    items: [
      '本文は Noto Sans JP',
      'h1 / h2 は Noto Serif JP',
      'h3 以降は Noto Sans JP',
      'Shippori Mincho は限定アクセント専用',
    ],
  },
  {
    title: 'English Typography',
    description: '英語は UI と演出の線引きを明確にします。',
    items: [
      '英語本文と UI は Inter',
      '演出的な見出しだけ Playfair Display',
      '英語 UI に serif を混在させない',
      'button / nav / meta / tag は Inter に揃える',
    ],
  },
]

const implementationRules: RuleGroup[] = [
  {
    title: 'Tailwind × Token',
    description: '責務を分離して、見た目の意味づけは token へ寄せます。',
    items: [
      'Tailwind は layout / spacing / size / radius を担当する',
      'Design Token は color / typography / shadow を担当する',
      '視覚表現は token 経由で Tailwind に流す',
      'SCSS に spacing を定義しない',
    ],
  },
  {
    title: 'TSX / SCSS Ownership',
    description: 'コンポーネントの見た目は、そのコンポーネント配下で閉じます。',
    items: [
      'TSX と SCSS は同じディレクトリに置く',
      'SCSS は対応する TSX から直接 import する',
      '共通 styles/scss ディレクトリは作らない',
      'グローバル例外は src/styles/globals.css のみ',
    ],
  },
]

const tokenCards: TokenCard[] = [
  {
    title: 'Primary',
    token: '--color-primary',
    meaning: '信頼・知性・操作を担うブランドの軸',
    example: 'CTA / リンク / アクティブ状態',
  },
  {
    title: 'Secondary',
    token: '--color-secondary',
    meaning: '作品世界の重厚感を支えるベースカラー',
    example: 'Header / Footer / 背景アクセント',
  },
  {
    title: 'Text',
    token: '--color-text-primary / --color-text-secondary',
    meaning: '情報の優先度を文章で作り分ける',
    example: '本文 / 補助説明 / メタ情報',
  },
  {
    title: 'Fonts',
    token: '--font-body / --font-heading / --font-ui',
    meaning: '言語と役割に応じた書体の切り替え',
    example: '本文 / 見出し / UI',
  },
]

const Page = ({ children }: { children: ReactNode }) => (
  <div className='sb-design-rules-page'>
    <div className='sb-design-rules-shell'>{children}</div>
  </div>
)

const RuleSection = ({ title, description, items }: RuleGroup) => (
  <article className='sb-design-rules-card sb-design-rules-stack'>
    <div>
      <h2>{title}</h2>
      <p className='sb-design-rules-muted'>{description}</p>
    </div>
    <ul className='sb-design-rules-list'>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </article>
)

const meta = {
  title: 'Docs/Design Rules',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'KatsumaScore のデザインルールを Storybook 上で確認するための docs ページです。`docs/katsumascore_design_rules.md` と `src/styles/globals.css` の運用方針をまとめています。',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <Page>
      <section className='sb-design-rules-hero'>
        <div className='sb-design-rules-eyebrow'>Docs / Design Rules</div>
        <h1>Storybook から KatsumaScore のデザインルールを確認する</h1>
        <p className='sb-design-rules-lead'>
          ルール本文は <span className='sb-design-rules-code'>docs/katsumascore_design_rules.md</span>、
          実装の受け皿は <span className='sb-design-rules-code'>src/styles/globals.css</span>{' '}
          を基準にしています。Storybook では、色・Typography・実装責務をすぐ確認できるように整理しています。
        </p>
      </section>

      <section className='sb-design-rules-grid'>
        {tokenCards.map((card) => (
          <article className='sb-design-rules-token-card' key={card.title}>
            <div className='sb-design-rules-token-label'>{card.title}</div>
            <h2>{card.token}</h2>
            <p>{card.meaning}</p>
            <p className='sb-design-rules-muted'>{card.example}</p>
          </article>
        ))}
      </section>

      <section className='sb-design-rules-section'>
        <div className='sb-design-rules-section-head'>
          <h2>Color</h2>
          <p className='sb-design-rules-muted'>
            色は装飾ではなく意味で使う、という前提を Storybook 上でも確認できるようにしています。
          </p>
        </div>
        <div className='sb-design-rules-grid sb-design-rules-grid--two'>
          {colorRules.map((group) => (
            <RuleSection key={group.title} {...group} />
          ))}
        </div>
      </section>

      <section className='sb-design-rules-section'>
        <div className='sb-design-rules-section-head'>
          <h2>Typography</h2>
          <p className='sb-design-rules-muted'>
            日本語と英語を同じ扱いにせず、役割と言語の両方で font token を切り替えます。
          </p>
        </div>
        <div className='sb-design-rules-grid sb-design-rules-grid--two'>
          {typographyRules.map((group) => (
            <RuleSection key={group.title} {...group} />
          ))}
        </div>
      </section>

      <section className='sb-design-rules-section'>
        <div className='sb-design-rules-section-head'>
          <h2>Implementation</h2>
          <p className='sb-design-rules-muted'>
            Token の責務とコンポーネント所有の境界を、実装ルールとして固定します。
          </p>
        </div>
        <div className='sb-design-rules-grid sb-design-rules-grid--two'>
          {implementationRules.map((group) => (
            <RuleSection key={group.title} {...group} />
          ))}
        </div>
      </section>

      <section className='sb-design-rules-note'>
        <h2>Related Stories</h2>
        <p>
          詳細な token の棚卸しは <span className='sb-design-rules-code'>Styles/Typography</span>{' '}
          の `ColorPalette` と `FontFamilies` を使う前提です。このページは「ルールを読む入口」、個別 story は「実物を確認する場所」として使い分けます。
        </p>
      </section>
    </Page>
  ),
}
