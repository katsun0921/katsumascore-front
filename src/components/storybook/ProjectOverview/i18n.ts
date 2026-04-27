 
export const messages = {
  meta: {
    docsDescription: {
      ja: 'KatsumaScore プロジェクトの背景、アーキテクチャ、Storybook の見方を最初に確認するための overview ページです。',
      en: 'An overview page for understanding the project background, architecture, and how to navigate this Storybook first.',
    },
  },
  hero: {
    eyebrow: {
      ja: 'KatsumaScore Storybook',
      en: 'KatsumaScore Storybook',
    },
    title: {
      ja: 'このプロジェクトの全体像',
      en: 'Project Overview',
    },
    lead: {
      ja: 'KatsumaScore は、WordPress をコンテンツ管理に使いながら、Next.js で表示を担うヘッドレス構成へ移行中のフロントエンドです。Storybook では、その UI を部品単位で管理し、壊れにくさまで含めて仕様として確認します。',
      en: 'KatsumaScore is a frontend moving toward a headless setup where WordPress manages content and Next.js owns presentation. In Storybook, we manage the UI as reusable parts and verify resilience as part of the specification.',
    },
    designRulesCta: {
      ja: 'Design Rules を開く',
      en: 'Open Design Rules',
    },
    designRulesNote: {
      ja: '最初にデザイントークンと実装ルールを確認したい場合は、ここから `Docs/Design Rules` に移動できます。',
      en: 'If you want to review design tokens and implementation rules first, jump directly to Docs/Design Rules from here.',
    },
  },
  pillars: {
    headlessWordpress: {
      title: {
        ja: 'Headless WordPress',
        en: 'Headless WordPress',
      },
      body: {
        ja: '記事とメタ情報は WordPress REST API + ACF で管理し、フロントエンドは Next.js が表示責務を持ちます。',
        en: 'Posts and metadata are managed through the WordPress REST API plus ACF, while Next.js owns rendering on the frontend.',
      },
    },
    storybookFirstUi: {
      title: {
        ja: 'Storybook First UI',
        en: 'Storybook First UI',
      },
      body: {
        ja: 'Storybook は見た目確認だけでなく UI 仕様書として扱い、正常系よりも欠損や長文などの異常系を重視します。',
        en: 'Storybook is treated as a UI specification, not just a visual sandbox, with emphasis on broken, missing, and edge-case data.',
      },
    },
    roleBasedStyling: {
      title: {
        ja: 'Role Based Styling',
        en: 'Role Based Styling',
      },
      body: {
        ja: 'Next.js のページは Tailwind CSS v4、Storybook のコンポーネント資産は SCSS を基本にし、責務を明確に分けています。',
        en: 'Next.js pages mainly use Tailwind CSS v4, while Storybook component assets stay SCSS-based so responsibilities remain clear.',
      },
    },
  },
  flow: {
    title: {
      ja: '開発フロー',
      en: 'Development Flow',
    },
    description: {
      ja: 'データ定義と UI 定義を切り分け、WordPress テーマ資産を React コンポーネントへ分解しながら運用します。',
      en: 'We separate data definition from UI definition and keep decomposing WordPress theme assets into React components.',
    },
    steps: {
      first: {
        ja: 'WordPress が記事本文、ACF、言語情報を REST API で提供する',
        en: 'WordPress provides post content, ACF data, and locale data through the REST API',
      },
      second: {
        ja: 'フロントエンド側でレスポンスを UI 用の型へ変換する',
        en: 'The frontend transforms those responses into UI-friendly view models',
      },
      third: {
        ja: 'Storybook 上で UI の正常系と異常系を先に検証する',
        en: 'Storybook validates both happy paths and failure paths before page integration',
      },
      fourth: {
        ja: 'Next.js ページで同じコンポーネントを組み立てて本番表示へつなぐ',
        en: 'Next.js pages assemble the same components for production rendering',
      },
    },
  },
  directoryGuide: {
    title: {
      ja: 'ディレクトリガイド',
      en: 'Directory Guide',
    },
    ui: {
      label: { ja: 'ui', en: 'ui' },
      description: {
        ja: '最小の表示部品。Score や Badge など、意味より再利用性を優先する層。',
        en: 'Smallest visual building blocks such as Score and Badge, optimized for reuse.',
      },
    },
    features: {
      label: { ja: 'features', en: 'features' },
      description: {
        ja: '記事カード、VOD、サイドバーなど、意味を持つ UI のまとまり。',
        en: 'Meaningful UI groups such as post cards, VOD panels, and sidebar units.',
      },
    },
    layout: {
      label: { ja: 'layout', en: 'layout' },
      description: {
        ja: 'Header / Footer / Grid など、配置と骨格を扱う層。',
        en: 'Structural pieces such as Header, Footer, and Grid that manage layout.',
      },
    },
    templates: {
      label: { ja: 'templates', en: 'templates' },
      description: {
        ja: 'ページ全体の構造を表す最上位の組み立て。',
        en: 'Top-level page compositions that show the full screen structure.',
      },
    },
    docs: {
      label: { ja: 'docs', en: 'docs' },
      description: {
        ja: '設計意図、ルール、全体像を素早く共有するための入口ページ。',
        en: 'Entry pages for sharing intent, rules, and project-wide context quickly.',
      },
    },
  },
  nextSteps: {
    title: {
      ja: 'このページの次に見る場所',
      en: 'What To Read Next',
    },
    designRules: {
      ja: 'Docs/Design Rules でデザイントークンと実装ルールを確認する',
      en: 'Read Docs/Design Rules for design tokens and implementation rules',
    },
    typography: {
      ja: 'Styles/Typography でタイポグラフィと色の棚卸しを見る',
      en: 'Open Styles/Typography to review typography and color inventory',
    },
    chaos: {
      ja: '各 feature の Chaos / Stress stories で壊れ方を先に確認する',
      en: 'Check Chaos and Stress stories in each feature to inspect failure behavior first',
    },
  },
  sections: {
    purpose: {
      title: {
        ja: 'プロジェクトの目的',
        en: 'Project Goal',
      },
      first: {
        ja: 'Cloudflare 導入後の WordPress 管理画面セッション問題を回避するため、管理画面と表示フロントを分離しています。',
        en: 'The admin experience and the public frontend are separated to avoid WordPress session issues introduced after Cloudflare adoption.',
      },
      second: {
        ja: '本番フロントは Next.js Pages Router を採用し、Storybook で分解した UI をそのまま再利用する構成です。',
        en: 'The production frontend uses the Next.js Pages Router and reuses the UI decomposed in Storybook.',
      },
      third: {
        ja: 'WordPress はデータ定義、Storybook は UI 定義という役割分担を前提に進めています。',
        en: 'The project is built on the separation that WordPress defines data while Storybook defines UI.',
      },
    },
    reading: {
      title: {
        ja: 'この Storybook の見方',
        en: 'How To Read This Storybook',
      },
      first: {
        ja: 'Docs は全体方針や設計ルールを確認する入口です。',
        en: 'Docs acts as the entry point for project-wide guidance and design rules.',
      },
      second: {
        ja: 'UI / Features / Layout / Templates は責務単位で分かれており、UI は最小部品、Features は意味を持つまとまり、Templates はページ骨格を表します。',
        en: 'UI, Features, Layout, and Templates are organized by responsibility: UI for atoms, Features for meaning, Templates for page skeletons.',
      },
      third: {
        ja: 'Chaos / Stress stories は実運用の欠損データや長文データに対して壊れないかを確認するための stories です。',
        en: 'Chaos and Stress stories exist to verify that the UI survives missing fields, long copy, and other realistic CMS failures.',
      },
    },
    rules: {
      title: {
        ja: '開発の基本ルール',
        en: 'Core Development Rules',
      },
      first: {
        ja: 'コンポーネント内でデータ取得をしないこと。',
        en: 'Do not fetch data inside UI components.',
      },
      second: {
        ja: 'variant の分岐を肥大化させず、UI とレイアウトの責務を混在させないこと。',
        en: 'Avoid bloated variant branching and keep UI concerns separate from layout concerns.',
      },
      third: {
        ja: 'API レスポンスはそのまま扱わず、UI に渡す前に整形して null / 欠損を吸収すること。',
        en: 'Transform API responses before they reach the UI so null and missing states are handled upfront.',
      },
    },
  },
} as const;
