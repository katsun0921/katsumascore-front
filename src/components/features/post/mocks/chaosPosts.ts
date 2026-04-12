/**
 * chaosPosts — Shared chaos dataset for Chaos Storybook stories
 *
 * This is NOT clean data. It intentionally simulates a real WordPress CMS dump:
 * - inconsistent field completeness
 * - wildly varying title and excerpt lengths
 * - mixed image availability
 * - old and recent publishedAt dates
 * - missing optional metadata
 *
 * DO NOT normalize or clean up this data.
 * If the UI survives this, it is production-ready.
 */

import type { Post } from '@/components/features/Post/types/post';

export const chaosPosts: Post[] = [
  // 1. Normal post — baseline for comparison within chaos context
  {
    id: 'chaos-001',
    slug: '/posts/hanataba-review',
    title: '映画『花束みたいな恋をした』レビュー',
    excerpt: '登場人物の距離感や東京の空気を追いながら、恋愛映画としての切なさを丁寧に読み解くレビューです。',
    image: '/images/mock-image.webp',
    publishedAt: '2026-04-01',
    category: '映画',
    score: 4,
  },

  // 2. Extremely long title (130+ chars) — tests title overflow and card height expansion
  {
    id: 'chaos-002',
    slug: '/posts/gundam-long-review',
    title:
      '劇場版『機動戦士ガンダム ジークアクス』はなぜここまで観客の感情を揺さぶるのかを、脚本・演出・音響設計・カメラワーク・キャラクター造形のすべての積み重ねという観点から、公開初週に劇場で体感したうえで丁寧に読み解いてみる長大レビュー【ネタバレあり】',
    excerpt: '音響と映像の密度についての詳細分析。',
    image: '/images/mock-image.webp',
    publishedAt: '2026-03-28',
    category: 'アニメ',
    score: 5,
  },

  // 3. No image — fallback block must fill the media area
  {
    id: 'chaos-003',
    slug: '/posts/spring-drama-no-image',
    title: '春ドラマ 注目作3本を比較する',
    excerpt: '今季は粒ぞろいのドラマが多い。その中から特に印象に残った3本を取り上げて比較します。',
    image: null,
    publishedAt: '2026-04-02',
    category: 'ドラマ',
    score: 3,
  },

  // 4. Very short title — tests minimum height handling
  {
    id: 'chaos-004',
    slug: '/posts/short',
    title: '映',
    excerpt: '短い概要。',
    image: '/images/mock-image.webp',
    publishedAt: '2026-01-15',
    category: '映画',
    score: 2,
  },

  // 5. Missing category — optional field absent
  {
    id: 'chaos-005',
    slug: '/posts/no-category-article',
    title: 'カテゴリー未設定の記事：WordPress管理画面の設定漏れによる典型的なデータ欠落',
    excerpt: 'カテゴリーが設定されていない記事がWordPressでは稀に発生します。UIが壊れないことを確認します。',
    image: '/images/mock-image.webp',
    publishedAt: '2025-11-30',
    // category: undefined
    score: 3,
  },

  // 6. Missing score — review_score ACF field not filled
  {
    id: 'chaos-006',
    slug: '/posts/no-score-article',
    title: 'スコア未入力の記事',
    excerpt: 'ACFのreview_scoreフィールドが空のまま公開された記事のシミュレーションです。',
    image: null,
    publishedAt: '2026-02-14',
    category: '映画',
    // score: undefined
  },

  // 7. Very old publishedAt — date formatting edge case
  {
    id: 'chaos-007',
    slug: '/posts/old-post-2019',
    title: '2019年に公開された古い記事：レイアウトへの影響確認',
    excerpt: '数年前に書かれた記事もWordPressから取得されて表示される可能性があります。',
    image: '/images/mock-image.webp',
    publishedAt: '2019-07-04',
    category: 'アニメ',
    score: 4,
  },

  // 8. Both category and score missing — maximum optional field absence
  {
    id: 'chaos-008',
    slug: '/posts/bare-minimum',
    title: 'カテゴリーもスコアも未設定',
    excerpt: 'メタデータが最低限しかない記事。UIのフォールバック表示を確認します。',
    image: null,
    publishedAt: '2025-06-01',
    // category: undefined
    // score: undefined
  },

  // 9. Extremely long excerpt — tests excerpt overflow
  {
    id: 'chaos-009',
    slug: '/posts/frieren-long-excerpt',
    title: 'アニメ『葬送のフリーレン』第2クールを振り返る',
    excerpt:
      'このアニメが2クール通じて一貫して描いてきたのは「時間」という概念に対するエルフと人間の非対称な感覚の差異であり、フリーレン自身が数百年のスパンで物事を捉えるがゆえに人間との別れを軽く扱ってしまうという悲劇的な構造を、回想と現在の往復によって視聴者に丁寧に体感させる演出の積み重ねが最終話に至るまで一切ぶれることなく貫かれていたという点において、このシーズンは間違いなく傑作と呼ぶに値します。',
    image: '/images/mock-image.webp',
    publishedAt: '2024-03-22',
    category: 'アニメ',
    score: 5,
  },

  // 10. Very recent post
  {
    id: 'chaos-010',
    slug: '/posts/today-post',
    title: '今日公開の記事',
    excerpt: '公開直後の記事のシミュレーション。',
    image: '/images/mock-image.webp',
    publishedAt: '2026-04-04',
    category: '映画',
    score: 4,
  },

  // 11. Long title + no image — compound stress
  {
    id: 'chaos-011',
    slug: '/posts/long-title-no-image',
    title:
      '映像化不可能と言われた原作を完全映像化した監督の意図とアニメーション技術の限界への挑戦、そして世界市場への訴求を同時に達成した作品として後世に語り継がれるであろう傑作についての包括的批評【全8話完走レビュー・ネタバレ全開】',
    excerpt: '画像なし＋超長タイトルの組み合わせ。最も過酷なカード条件です。',
    image: null,
    publishedAt: '2026-01-10',
    category: 'アニメ',
    // score: undefined
  },

  // 12. Single character excerpt
  {
    id: 'chaos-012',
    slug: '/posts/one-char-excerpt',
    title: '概要が1文字しかない記事',
    excerpt: '。',
    image: '/images/mock-image.webp',
    publishedAt: '2023-12-31',
    category: 'ドラマ',
    score: 1,
  },

  // 13. Score = 1 (lowest) — visual check for low score badge
  {
    id: 'chaos-013',
    slug: '/posts/lowest-score',
    title: 'スコア最低値（1）の記事',
    excerpt: '期待していたが残念だった作品のレビュー。スコア1のバッジ表示確認。',
    image: '/images/mock-image.webp',
    publishedAt: '2025-09-15',
    category: '映画',
    score: 1,
  },

  // 14. Score = 5 (highest) + long title
  {
    id: 'chaos-014',
    slug: '/posts/perfect-score-long-title',
    title: '満点評価を与えたい作品：脚本・演出・音楽・キャスト・映像のすべてが噛み合った奇跡的な一作の全力レビュー',
    excerpt: 'スコア5＋長タイトルのコンビネーション。高得点記事の表示崩れを確認します。',
    image: '/images/mock-image.webp',
    publishedAt: '2026-03-01',
    category: 'アニメ',
    score: 5,
  },

  // 15. No image + no score + no category — three fields absent simultaneously
  {
    id: 'chaos-015',
    slug: '/posts/triple-missing',
    title: '画像・スコア・カテゴリーがすべて欠落した記事',
    excerpt: '3つの任意フィールドが同時に欠落しています。最も素のカード状態を確認します。',
    image: null,
    publishedAt: '2025-03-03',
    // category: undefined
    // score: undefined
  },

  // 16. Very long title + very long excerpt + no image — maximum content density, no image
  {
    id: 'chaos-016',
    slug: '/posts/density-max',
    title:
      '2026年冬クール総括：全14作品を見届けた上で語る今季の傾向と、特に際立った演出・脚本の評価軸について【完走レビュー】',
    excerpt:
      'ここ数クールの傾向として、制作会社の大規模化と原作の多様化が同時進行しており、それが作品の仕上がりの振れ幅をより大きくしているという構造的問題が2026年冬クールでも顕著でした。特に映像品質とシナリオ密度の乖離が激しく、見た目は整っているが内容が薄い作品と、粗削りだが物語の芯が太い作品が混在する形になりました。',
    image: null,
    publishedAt: '2026-02-28',
    category: 'アニメ',
    score: 3,
  },

  // 17. Future publishedAt — scheduled post edge case
  {
    id: 'chaos-017',
    slug: '/posts/future-post',
    title: '未来の日付を持つ記事（スケジュール公開のシミュレーション）',
    excerpt: '将来の公開日が設定されているが何らかの理由でAPIから返ってきてしまった記事。',
    image: '/images/mock-image.webp',
    publishedAt: '2027-01-01',
    category: '映画',
    score: 2,
  },

  // 18. Normal — mix anchor to keep the chaos set grounded
  {
    id: 'chaos-018',
    slug: '/posts/normal-anchor',
    title: '通常のレビュー記事：基準として混在させています',
    excerpt: '整ったデータの記事。カオスデータセットの中に混ぜることで、正常な表示との対比確認ができます。',
    image: '/images/mock-image.webp',
    publishedAt: '2026-04-03',
    category: 'ドラマ',
    score: 3,
  },

  // 19. No image + old date + no score
  {
    id: 'chaos-019',
    slug: '/posts/old-no-image-no-score',
    title: '古い記事・画像なし・スコアなし',
    excerpt: '複数の欠落が重なる古い記事のシミュレーション。',
    image: null,
    publishedAt: '2020-05-12',
    category: 'アニメ',
    // score: undefined
  },

  // 20. Short title + image + no category — partially incomplete
  {
    id: 'chaos-020',
    slug: '/posts/short-no-cat',
    title: '短タイトル',
    excerpt: 'カテゴリーなし。',
    image: '/images/mock-image.webp',
    publishedAt: '2026-03-20',
    // category: undefined
    score: 2,
  },

  // 21. Extremely long title + high score + normal image — full heavy card
  {
    id: 'chaos-021',
    slug: '/posts/heavy-full-card',
    title:
      '映画『ドライブ・マイ・カー』が世界で評価された理由を、村上春樹原作・濱口竜介監督・西島秀俊主演という3つの視点から多角的に分析するとともに、日本映画における長回し演技演出の系譜を辿る',
    excerpt: '120分を超える上映時間の中に積み重ねられた静かな緊張感の解剖。',
    image: '/images/mock-image.webp',
    publishedAt: '2022-08-10',
    category: '映画',
    score: 5,
  },

  // 22. Score just above minimum + no image + long title
  {
    id: 'chaos-022',
    slug: '/posts/low-score-no-image',
    title: '低スコアかつ画像なし：がっかりした作品についての率直なレビュー【辛口批評】',
    excerpt: '期待値が高すぎたこともあり、評価は辛めです。',
    image: null,
    publishedAt: '2025-12-25',
    category: 'ドラマ',
    score: 2,
  },
];
