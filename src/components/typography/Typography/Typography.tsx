import type { ReactNode } from 'react';
type TypographyVariant = 'overview' | 'palette' | 'fonts' | 'font-sizes';

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
  { name: 'Primary Dark', token: '--color-primary-dark', value: '#1e40af', textColor: '#ffffff' },
  { name: 'Secondary', token: '--color-secondary', value: '#1e1b4b', textColor: '#ffffff' },
  { name: 'Accent', token: '--color-accent', value: '#6d28d9', textColor: '#ffffff' },
  { name: 'Accent Strong', token: '--color-accent-strong', value: '#ff2dfc' },
  { name: 'Header', token: '--color-header', value: '#1e1b4b', textColor: '#ffffff' },
  { name: 'Navigation', token: '--color-navigation', value: '#1e1b4b', textColor: '#ffffff' },
  { name: 'Footer', token: '--color-footer', value: '#0e011c', textColor: '#ffffff' },
];

const surfaceColors: Swatch[] = [
  { name: 'Background', token: '--color-bg', value: '#ffffff' },
  { name: 'Background Muted', token: '--color-bg-muted', value: '#f3f4f6' },
  { name: 'Surface', token: '--color-surface', value: '#f7f7f7' },
  { name: 'Background Dark', token: '--color-bg-dark', value: '#0a0618', textColor: '#ffffff' },
  { name: 'Surface Dark', token: '--color-surface-dark', value: '#1a1030', textColor: '#ffffff' },
  { name: 'Border Muted', token: '--color-border-muted', value: '#e0e0e0' },
  { name: 'Border', token: '--color-border', value: '#d1d5db' },
  { name: 'Border Soft', token: '--color-border-soft', value: 'rgba(0,0,0,0.1)' },
  { name: 'Highlight BG', token: '--color-highlight-bg', value: '#fefce8' },
  { name: 'Highlight Mark', token: '--color-highlight-mark', value: '#fef08a' },
  { name: 'BG Code', token: '--color-bg-code', value: '#111827', textColor: '#ffffff' },
];

const textAndFeatureColors: Swatch[] = [
  { name: 'Text Primary', token: '--color-text-primary', value: '#111827', textColor: '#ffffff' },
  { name: 'Text Secondary', token: '--color-text-secondary', value: '#6b7280', textColor: '#ffffff' },
  { name: 'Text Muted', token: '--color-text-muted', value: '#616161', textColor: '#ffffff' },
  { name: 'Text Inverse', token: '--color-text-inverse', value: '#ffffff' },
  { name: 'Black', token: '--color-black', value: '#000000', textColor: '#ffffff' },
  { name: 'Accent Yellow', token: '--color-accent-yellow', value: '#eab308' },
  { name: 'Score BG', token: '--color-score-bg', value: '#14082e', textColor: '#ffffff' },
  { name: 'Score Accent', token: '--color-score-accent', value: '#ff2dfc' },
  { name: 'Accent Soft', token: '--color-accent-soft', value: '#c084fc' },
  { name: 'Score Rank Low', token: '--color-score-rank-low', value: '#64748b' },
  { name: 'Score Rank Mid', token: '--color-score-rank-mid', value: '#2563eb' },
  { name: 'Score Rank High', token: '--color-score-rank-high', value: '#c026d3' },
  { name: 'Score Hero Text Halo', token: '--color-score-hero-text-halo', value: '#ffffff' },
];

const serviceColors: Swatch[] = [
  { name: 'Netflix', token: '--color-netflix', value: '#e50914', textColor: '#ffffff' },
  { name: 'Amazon', token: '--color-amazon', value: '#00a8e1' },
  { name: 'Amazon Shopping', token: '--color-amazon-shopping', value: '#ff9900' },
  { name: 'Rakuten', token: '--color-rakuten', value: '#bf0000', textColor: '#ffffff' },
  { name: 'U-NEXT', token: '--color-unext', value: '#1a1a1a', textColor: '#ffffff' },
  { name: 'Disney+', token: '--color-disney', value: '#113ccf', textColor: '#ffffff' },
  { name: 'DMMTV', token: '--color-dmmtv', value: '#ff4b00', textColor: '#ffffff' },
  { name: 'Abema', token: '--color-abema', value: '#00bcd4' },
  { name: 'AppleTV+', token: '--color-appletv', value: '#555555', textColor: '#ffffff' },
  { name: 'YouTube', token: '--color-youtube', value: '#ff0000', textColor: '#ffffff' },
  { name: 'Twitter', token: '--color-twitter', value: '#1da1f2' },
  { name: 'X', token: '--color-x', value: '#000000', textColor: '#ffffff' },
  { name: 'Facebook', token: '--color-facebook', value: '#1877f2', textColor: '#ffffff' },
  { name: 'Instagram', token: '--color-instagram', value: '#e1306c', textColor: '#ffffff' },
  { name: 'LINE', token: '--color-line', value: '#06c755' },
  { name: 'RSS', token: '--color-rss', value: '#ec7c1c' },
  { name: 'TSUTAYA', token: '--color-tsutaya', value: '#003087', textColor: '#ffffff' },
  { name: 'GEO', token: '--color-geo', value: '#0066cc', textColor: '#ffffff' },
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
    stack: '"Kaisei Tokumin", serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--heading',
    sampleText: '映画レビューに信頼と作品性を与える、日本語見出し用のセリフです。',
    note: 'h1 と h2 の既定値です。Serif 600〜700 を見出しに限定して使います。',
  },
  {
    name: 'Japanese Accent Strong',
    token: '--font-accent-strong / .font-accent-strong',
    stack: '"Rampart One", sans-serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--accent-strong',
    sampleText: 'ランキング・スコア・特集で強いインパクトを与える限定書体です。',
    note: '常用禁止です。ランキング・スコア・特集など視線を止めたい場面に限定します。',
  },
  {
    name: 'Japanese Accent Soft',
    token: '--font-accent-soft / .font-accent-soft',
    stack: '"Yusei Magic", sans-serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--accent-soft',
    sampleText: 'タグ・補助ラベル・軽いCTAに親しみと軽やかさで寄り添う書体です。',
    note: '常用禁止です。タグ・補助ラベル・軽い CTA に限定して使います。',
  },
  {
    name: 'English Base / UI',
    token: '--font-en-base',
    stack: '"Inter", system-ui, sans-serif',
    sampleClassName: 'sb-typography-font-sample sb-typography-font-sample--en-base',
    sampleText: 'Inter keeps UI copy clear, stable, and easy to scan across dense layouts.',
    note: '英語本文と UI の既定値です。Base / UI は常に Inter を使います。英語の演出的フォントは使用しません。',
  },
];

const fontRules = [
  '本文は Noto Sans JP を使い、情報を正しく読ませることを優先する。',
  'h1 / h2 は Kaisei Tokumin を使い、信頼と作品性を付与する。',
  'h3 以降は Noto Sans JP に戻す。',
  'Rampart One はランキング・スコア・特集など強いインパクトが必要な場面のみ。',
  'Yusei Magic はタグ・補助ラベル・軽い CTA に限定する。',
  'アクセントフォントは常用しない（使用率を制限する）。',
  '英語本文と英語 UI は Inter を使い、一貫して明快に見せる。',
  '英語の演出的フォントは使用しない（日本語設計との一貫性を優先）。',
];

const weightRules = [
  'Sans 400: 本文',
  'Sans 500: UI',
  'Sans 700: 強調',
  'Serif 600〜700: 見出し',
];

type FontSizeEntry = {
  role: string;
  tokenPc: string;
  valuePc: string;
  tokenSp: string;
  valueSp: string;
  sampleText: string;
};

const fontSizeEntries: FontSizeEntry[] = [
  {
    role: 'Title',
    tokenPc: '--font-size-title-lg',
    valuePc: '48px',
    tokenSp: '--font-size-title-sm',
    valueSp: '32px',
    sampleText: '作品タイトル（PostHeader）',
  },
  {
    role: 'H1',
    tokenPc: '--font-size-h1-lg',
    valuePc: '32px',
    tokenSp: '--font-size-h1-sm',
    valueSp: '24px',
    sampleText: '映画レビューの見出し',
  },
  {
    role: 'H2',
    tokenPc: '--font-size-h2-lg',
    valuePc: '24px',
    tokenSp: '--font-size-h2-sm',
    valueSp: '20px',
    sampleText: 'セクション見出し',
  },
  {
    role: 'H3',
    tokenPc: '--font-size-h3-lg',
    valuePc: '20px',
    tokenSp: '--font-size-h3-sm',
    valueSp: '18px',
    sampleText: 'サブセクション見出し',
  },
  {
    role: 'Body',
    tokenPc: '--font-size-body-lg',
    valuePc: '16px',
    tokenSp: '--font-size-body-sm',
    valueSp: '15px',
    sampleText: '本文テキストの基準サイズです。読みやすさを最優先にしています。',
  },
  {
    role: 'UI',
    tokenPc: '--font-size-ui',
    valuePc: '12–14px (clamp)',
    tokenSp: '--font-size-ui',
    valueSp: '12–14px (clamp)',
    sampleText: 'ボタン・ラベル・ナビゲーション',
  },
  {
    role: 'Caption',
    tokenPc: '--font-size-caption-lg',
    valuePc: '12px',
    tokenSp: '--font-size-caption-sm',
    valueSp: '11px',
    sampleText: '補足・メタ情報・キャプション',
  },
  {
    role: 'Score Hero Int',
    tokenPc: '--font-size-score-hero-int-lg',
    valuePc: '120px',
    tokenSp: '--font-size-score-hero-int-sm',
    valueSp: '72px',
    sampleText: '4',
  },
  {
    role: 'Score Hero Decimal',
    tokenPc: '--font-size-score-hero-decimal-lg',
    valuePc: '60px',
    tokenSp: '--font-size-score-hero-decimal-sm',
    valueSp: '36px',
    sampleText: '.3',
  },
];

const fontSizeRules = [
  'font-size は必ず CSS token (var(--font-size-*)) 経由で指定する。',
  'PC と SP で別 token を使い分ける（--font-size-*-pc / --font-size-*-sp）。',
  'style prop に直接 px 値・rem 値を書かない。',
  'Tailwind の任意値 text-[16px] は禁止。text-body / text-h1 などの token クラスを使う。',
  'ESLint ルール katsumascore-ui/no-direct-font-size が違反を error として検出する。',
];

const Page = ({ children }: { children: ReactNode }) => (
  <div className='sb-typography-page'>
    <div className='sb-typography-shell'>{children}</div>
  </div>
);

const FontSizeSection = () => (
  <Page>
    <section className='sb-typography-hero'>
      <div className='sb-typography-eyebrow'>Font Size Tokens</div>
      <h1>font-size の一覧</h1>
      <p className='sb-typography-lead'>
        PC / SP 別に定義された font-size token の一覧です。コンポーネントはこの token を必ず経由し、直接値の記述を禁止しています。
      </p>
    </section>

    <div className='sb-typography-card sb-typography-font-list'>
      <section className='sb-typography-font-guidelines'>
        <article className='sb-typography-rule-card'>
          <h2>Usage Rules</h2>
          <ul className='sb-typography-rule-list'>
            {fontSizeRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>
      </section>

      <div className='sb-typography-font-size-table'>
        <div className='sb-typography-font-size-header'>
          <span>Role</span>
          <span>PC Token</span>
          <span>PC Value</span>
          <span>SP Token</span>
          <span>SP Value</span>
          <span>Sample</span>
        </div>
        {fontSizeEntries.map((entry) => (
          <article className='sb-typography-font-size-row' key={entry.role}>
            <span className='sb-typography-font-size-role'>{entry.role}</span>
            <span className='sb-typography-token'>{entry.tokenPc}</span>
            <span className='sb-typography-font-size-value'>{entry.valuePc}</span>
            <span className='sb-typography-token'>{entry.tokenSp}</span>
            <span className='sb-typography-font-size-value'>{entry.valueSp}</span>
            <span
              className='sb-typography-font-size-sample'
              style={{ fontSize: `var(${entry.tokenPc})` }}
            >
              {entry.sampleText}
            </span>
          </article>
        ))}
      </div>

      <div className='sb-typography-note'>
        token は <span className='sb-typography-code'>src/styles/globals.css</span> の{' '}
        <span className='sb-typography-code'>:root</span> で一元管理しています。
        Tailwind の <span className='sb-typography-code'>@theme inline</span> でも{' '}
        <span className='sb-typography-code'>text-body</span> / <span className='sb-typography-code'>text-h1</span>{' '}
        等のクラスとして使えます。
      </div>
    </div>
  </Page>
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
            `DESIGN.md` の方針を Storybook で確認しやすい形に寄せています。
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
        グローバル方針は `src/styles/globals.css` と `DESIGN.md` を基準にし、
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

  if (variant === 'font-sizes') {
    return <FontSizeSection />;
  }

  return <OverviewSection />;
};
