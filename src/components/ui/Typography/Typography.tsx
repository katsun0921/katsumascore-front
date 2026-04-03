import type { ReactNode } from 'react';
import './Typography.stories.scss';

type TypographyVariant = 'overview' | 'palette' | 'fonts';

type TypographyProps = {
  variant?: TypographyVariant;
};

type Swatch = {
  name: string;
  token: string;
  value: string;
  textColor?: string;
};

type FontEntry = {
  name: string;
  token: string;
  stack: string;
  sampleClassName: string;
  sampleText: string;
  note: string;
};

const brandColors: Swatch[] = [
  { name: 'Primary', token: '--color-primary', value: '#2563eb', textColor: '#ffffff' },
  { name: 'Secondary', token: '--color-secondary', value: '#1e1b4b', textColor: '#ffffff' },
  { name: 'Accent', token: '--color-accent', value: '#6d28d9', textColor: '#ffffff' },
  { name: 'Category', token: '--color-category', value: '#5c39f2', textColor: '#ffffff' },
];

const surfaceColors: Swatch[] = [
  { name: 'Background', token: '--color-bg', value: '#ffffff' },
  { name: 'Background Muted', token: '--color-bg-muted', value: '#f3f4f6' },
  { name: 'Surface Muted', token: '--color-surface-muted', value: '#f7f7f7' },
  { name: 'Border Muted', token: '--color-border-muted', value: '#e0e0e0' },
];

const textAndFeatureColors: Swatch[] = [
  { name: 'Text Primary', token: '--color-text-primary', value: '#111827', textColor: '#ffffff' },
  { name: 'Text Secondary', token: '--color-text-secondary', value: '#6b7280', textColor: '#ffffff' },
  { name: 'Score BG', token: '--color-score-bg', value: '#14082e', textColor: '#ffffff' },
  { name: 'Score Border', token: '--color-score-border', value: '#ff2dfc' },
];

const serviceColors: Swatch[] = [
  { name: 'Netflix', token: '--color-netflix', value: '#e50914', textColor: '#ffffff' },
  { name: 'Amazon', token: '--color-amazon', value: '#00a8e1' },
  { name: 'U-NEXT', token: '--color-unext', value: '#1a1a1a', textColor: '#ffffff' },
  { name: 'Twitter', token: '--color-twitter', value: '#1da1f2' },
  { name: 'Facebook', token: '--color-facebook', value: '#1877f2', textColor: '#ffffff' },
  { name: 'RSS', token: '--color-rss', value: '#ec7c1c' },
];

const fontEntries: FontEntry[] = [
  {
    name: 'Japanese Body',
    token: '--font-ja-body',
    stack: '"Noto Sans JP", system-ui, sans-serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--body',
    sampleText: '本文テキストの基準です。情報を正しく読ませるための日本語サンセリフです。',
    note: '本文の既定値です。Sans 400 を基本に、必要に応じて 500 を UI、700 を強調に使います。',
  },
  {
    name: 'Japanese Heading',
    token: '--font-ja-heading',
    stack: '"Noto Serif JP", serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--heading',
    sampleText: '映画レビューに信頼と格を与える、日本語見出し用のセリフです。',
    note: 'h1 と h2 の既定値です。Serif 600〜700 を見出しに限定して使います。',
  },
  {
    name: 'Japanese Accent',
    token: '--font-ja-accent / .font-accent',
    stack: '"Shippori Mincho", "Noto Serif JP", serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--accent-ja',
    sampleText: '余韻や世界観を一瞬で立ち上げたい場面だけに使う限定書体です。',
    note: '限定運用です。本文や通常見出しには使わず、アクセント専用クラスだけで使います。',
  },
  {
    name: 'English Base / UI',
    token: '--font-en-base',
    stack: '"Inter", system-ui, sans-serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--en-base',
    sampleText: 'Inter keeps UI copy clear, stable, and easy to scan across dense layouts.',
    note: '英語本文と UI の既定値です。Base / UI は常に Inter を使います。',
  },
  {
    name: 'English Display',
    token: '--font-en-display',
    stack: '"Playfair Display", serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--en-display',
    sampleText: 'Playfair Display adds tone, contrast, and editorial character to featured headlines.',
    note: '英語のアクセント見出し用です。通常 UI や本文には使いません。',
  },
];

const fontRules = [
  '本文は Noto Sans JP を使い、情報を正しく読ませることを優先する。',
  '見出しは Noto Serif JP を使い、信頼と格を付与する。',
  'Shippori Mincho は世界観を作るための限定アクセントとしてのみ使う。',
  '英語本文と英語 UI は Inter を使い、一貫して明快に見せる。',
  '英語の演出的な見出しだけ Playfair Display を使う。',
];

const weightRules = [
  'Sans 400: 本文',
  'Sans 500: UI',
  'Sans 700: 強調',
  'Serif 600〜700: 見出し',
];

const Page = ({ children }: { children: ReactNode }) => (
  <div className='sb-typography-page'>
    <div className='sb-typography-shell'>{children}</div>
  </div>
);

const ColorSection = ({
  title,
  description,
  colors,
}: {
  title: string;
  description: string;
  colors: Swatch[];
}) => (
  <section className='sb-typography-stack'>
    <div>
      <h3>{title}</h3>
      <p className='sb-typography-muted'>{description}</p>
    </div>
    <div className='sb-typography-swatches'>
      {colors.map((color) => (
        <article className='sb-typography-swatch' key={color.token}>
          <div
            className='sb-typography-swatch-chip'
            style={{
              backgroundColor: color.value,
              color: color.textColor ?? 'var(--color-text-primary)',
            }}
          >
            <span className='sb-typography-token'>{color.value}</span>
          </div>
          <div className='sb-typography-swatch-body'>
            <strong>{color.name}</strong>
            <span className='sb-typography-token'>{color.token}</span>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const OverviewSection = () => (
  <Page>
    <section className='sb-typography-hero'>
      <div className='sb-typography-eyebrow'>Global Typography</div>
      <h1>KatsumaScore の global typography を Storybook 上で確認する</h1>
      <p className='sb-typography-lead'>
        `globals.css` が決めている本文、見出し、リンク、補助テキストの見え方をまとめた確認用
        story です。色とフォントは下の stories で個別に棚卸しできます。
      </p>
    </section>

    <div className='sb-typography-grid'>
      <section className='sb-typography-card sb-typography-stack'>
        <div>
          <h2>Base Specimen</h2>
          <p>
            これは本文の基準サンプルです。body は <span className='sb-typography-code'>var(--font-body)</span>{' '}
            と <span className='sb-typography-code'>line-height: 1.8</span> を前提にしています。
          </p>
        </div>

        <div className='sb-typography-divider' />

        <div className='sb-typography-specimens'>
          <article className='sb-typography-specimen'>
            <div className='sb-typography-specimen-label'>Heading</div>
            <h1>映画レビューを深く読むためのタイポグラフィ</h1>
            <p className='sb-typography-muted'>見出しは `var(--font-heading)` と 700 weight が基準です。</p>
          </article>

          <article className='sb-typography-specimen'>
            <div className='sb-typography-specimen-label'>Body Copy</div>
            <p>
              作品紹介や考察文を読むときの可読性を優先しつつ、
              <a href='#'>リンクテキスト</a>
              は primary で識別できるようにしています。
            </p>
          </article>

          <article className='sb-typography-specimen'>
            <div className='sb-typography-specimen-label'>Scale</div>
            <h2>H2 見出し</h2>
            <h3>H3 見出し</h3>
            <h4>H4 見出し</h4>
          </article>

          <article className='sb-typography-specimen'>
            <div className='sb-typography-specimen-label'>Support Text</div>
            <p className='sb-typography-muted'>
              補助説明やメタ情報は `--color-text-secondary` を使って本文との優先度を分けます。
            </p>
          </article>
        </div>
      </section>

      <aside className='sb-typography-card sb-typography-stack'>
        <div>
          <h2>Quick Rules</h2>
          <p className='sb-typography-muted'>
            `docs/katsumascore_design_rules.md` の方針を Storybook で確認しやすい形に寄せています。
          </p>
        </div>
        <p>色は役割で選び、本文と見出しは token ベースのフォントで統一します。</p>
        <p>UI の例外フォントは story 下部の一覧で把握できます。</p>
        <p>
          直接値を書く前に、まず <span className='sb-typography-code'>--color-*</span> と{' '}
          <span className='sb-typography-code'>--font-*</span> を確認する前提です。
        </p>
        <div className='sb-typography-note'>
          Storybook では `preview.ts` 側で `--font-body` と `--font-heading` を補って、ページ本体に近い見え方へ寄せています。
        </div>
      </aside>
    </div>
  </Page>
);

const PaletteSection = () => (
  <Page>
    <section className='sb-typography-hero'>
      <div className='sb-typography-eyebrow'>Color Tokens</div>
      <h1>現在のカラーパレット一覧</h1>
      <p className='sb-typography-lead'>
        `src/styles/globals.css` にある token を役割ごとに並べています。いま何色が存在するかを Storybook 上で判断するための一覧です。
      </p>
    </section>

    <div className='sb-typography-card sb-typography-palette'>
      <ColorSection
        title='Brand'
        description='ブランドや強い UI の基調色です。'
        colors={brandColors}
      />
      <ColorSection
        title='Surface'
        description='背景面や境界線に使う落ち着いた色です。'
        colors={surfaceColors}
      />
      <ColorSection
        title='Text / Feature'
        description='本文色と Score まわりの重要色です。'
        colors={textAndFeatureColors}
      />
      <ColorSection
        title='Service / Social'
        description='VOD や SNS バッジで使うサービス固有色です。'
        colors={serviceColors}
      />
    </div>
  </Page>
);

const FontSection = () => (
  <Page>
    <section className='sb-typography-hero'>
      <div className='sb-typography-eyebrow'>Font Family</div>
      <h1>font-family の一覧</h1>
      <p className='sb-typography-lead'>
        `https://katsumascore.blog/` のテーマで読み込まれている Google Fonts のみを一覧化しています。
      </p>
    </section>

    <div className='sb-typography-card sb-typography-font-list'>
      <section className='sb-typography-font-guidelines'>
        <article className='sb-typography-rule-card'>
          <h2>Usage Rules</h2>
          <ul className='sb-typography-rule-list'>
            {fontRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>

        <article className='sb-typography-rule-card'>
          <h2>Weight Rules</h2>
          <ul className='sb-typography-rule-list'>
            {weightRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>
      </section>

      {fontEntries.map((font) => (
        <article className='sb-typography-font-card' key={font.name}>
          <div className='sb-typography-font-meta'>
            <h3>{font.name}</h3>
            <p className='sb-typography-token'>{font.token}</p>
            <p className='sb-typography-muted'>{font.stack}</p>
          </div>
          <div className={font.sampleClassName}>{font.sampleText}</div>
          <p className='sb-typography-muted'>{font.note}</p>
        </article>
      ))}
      <div className='sb-typography-note'>
        グローバル方針は `src/styles/globals.css` と `docs/katsumascore_design_rules.md` を基準にし、
        Storybook ではその運用ルールを日英で確認できるようにしています。
      </div>
    </div>
  </Page>
);

export const Typography = ({ variant = 'overview' }: TypographyProps) => {
  if (variant === 'palette') {
    return <PaletteSection />;
  }

  if (variant === 'fonts') {
    return <FontSection />;
  }

  return <OverviewSection />;
};
