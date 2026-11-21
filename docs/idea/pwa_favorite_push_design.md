# KatsumaScore PWA化・お気に入り・新着通知 調査 & 設計方針

> ステータス: idea（調査のみ・未着手）
> 作成日: 2026年10月24日
> 関連: [`vod_personalization_design.md`](vod_personalization_design.md)（VODパーソナライズ & 通知構想）

## ■ 概要

KatsumaScore フロントエンド（Next.js Pages Router + OpenNext / Cloudflare Workers）を PWA 化する場合の実現性を調査し、以下 3 点の結論と設計方針をまとめる。

1. Next.js と PWA の相性
2. PWA でのお気に入り登録
3. PWA での新規お知らせ通知（Web Push）

---

## ■ 結論サマリー

| 項目 | 判定 | 要点 |
|------|------|------|
| Next.js との相性 | ◎ 良好 | 公式ガイドあり。ただし App Router 前提のため Pages Router 向けに読み替えが必要 |
| お気に入り登録 | ◎ すぐ可能 | 端末ローカル保存なら PWA 化を待たずに実装できる |
| 新規お知らせ通知 | ○ 可能（工数大） | VAPID鍵・購読情報の保存先・送信 Worker が必要。iOS はホーム画面追加時のみ |

---

## ■ 1. Next.js との相性

### ■ 公式サポート

Next.js 公式ドキュメントに PWA ガイドがあり、以下が解説されている。

- Web App Manifest によるインストール対応
- Service Worker の登録（`/sw.js`）
- VAPID 公開鍵による Web Push 購読と購読情報の保存

### ■ 本リポジトリ固有の読み替え（Pages Router）

公式ガイドは App Router（`app/manifest.ts` / Server Actions）前提のため、以下に置き換える。

| 公式ガイド（App Router） | 本リポジトリ（Pages Router） |
|-------------------------|------------------------------|
| `app/manifest.ts` | `public/manifest.webmanifest` + `src/pages/_document.tsx` に `<link rel="manifest">` |
| Server Actions で購読保存 | `src/pages/api/` の API Route（または別 Worker の API） |
| `metadata` でアイコン指定 | `_document.tsx` の `<link rel="apple-touch-icon">` 等（`public/apple-touch-icon.png` は既存） |

### ■ Service Worker 実装の選択肢

| 方式 | 特徴 | 判断 |
|------|------|------|
| `public/sw.js` 手書き | 依存なし・挙動を完全に把握できる | **推奨（初期）**。キャッシュ対象が限定的なため十分 |
| Serwist | Workbox 系。webpack 前提 | `npm run build` が `next build --webpack` のため導入は可能 |
| `@ducanh2912/next-pwa` | Workbox ベース。オフラインフォールバック等が揃う | 同上 |

### ■ 最重要注意点：ISR / CDN キャッシュとの衝突

現行は ISR と `next.config.ts` の `s-maxage` / `stale-while-revalidate` で Edge キャッシュを精密に設計している。Service Worker が HTML をキャッシュすると、記事更新が端末に反映されない二重キャッシュ問題が起きる。

| 対象 | SW のキャッシュ戦略 |
|------|---------------------|
| HTML（ページ） | **Network First**。オフライン時のみ `/offline` フォールバック |
| `/_next/static/**`（ハッシュ付き） | Cache First（不変ファイル） |
| 画像・フォント | Stale While Revalidate（上限件数を設ける） |
| `/api/**`・`/_next/data/**` | キャッシュしない |
| `sw.js` 自体 | `Cache-Control: no-cache` を `next.config.ts` の `headers()` で付与し、更新を即時反映 |

### ■ Cloudflare（OpenNext）との関係

- `public/` 配下は `.open-next/assets` から静的配信されるため、`/sw.js` `/manifest.webmanifest` のルート配信は問題ない
- Service Worker のスコープはルート（`/`）。`/ja` `/en` のロケールパスも同一スコープで扱える
- OpenNext 起因の問題が出た場合は [`docs/develop/opennext_pages_router_custom_404.md`](../develop/opennext_pages_router_custom_404.md) に記録する（CLAUDE.md ルール）

---

## ■ 2. お気に入り登録

PWA 化とは独立して実装できる。段階的に進める。

### ■ 段階

| 段階 | 保存先 | 認証 | 内容 |
|------|--------|------|------|
| A. 端末ローカル | localStorage（件数増なら IndexedDB） | 不要 | 記事 slug・投稿タイプ・タイトル・サムネイル・登録日時を保存。工数小 |
| B. 端末間同期 | Cloudflare D1 / KV | **必要** | スマホ・PC で共有。認証基盤の新設が前提 |

### ■ データ構造（段階A案）

```ts
type TFavoriteItem = {
  slug: string;
  postType: 'movie' | 'anime' | 'drama';
  title: string;
  thumbnailUrl?: string;
  addedAt: string; // ISO 8601
};

type TFavoriteStore = {
  version: 1; // スキーマ変更時のマイグレーション用
  items: TFavoriteItem[];
};
```

- localStorage キー例: `ks:favorites`
- `try/catch` で読み書きし、プライベートブラウズ等で失敗しても画面が壊れないようにする
- `TFavoriteItem` は `normalizedPost` から生成する（WordPress レスポンスを直接保存しない）

### ■ 設計ルールとの整合

| ルール | 対応 |
|--------|------|
| レンダリング方式 | ページは ISR のまま。お気に入りボタン・一覧は client-side で描画 |
| レイヤー責務 | state を持つため `src/components/features/Favorite/` に配置 |
| 型配置 | 他ディレクトリから参照するなら `src/types/` へ |
| i18n | ボタン文言（「お気に入りに追加」等）は `i18n.ts` に ja / en で定義 |
| ハイドレーション | SSR 時は未登録状態で描画し、マウント後に localStorage を読む（不一致エラー回避） |

### ■ 注意点

- **iOS ではホーム画面に追加した PWA と Safari のストレージが分離される。** Safari で登録したお気に入りはホーム画面アプリでは表示されない
- 端末変更・ブラウザデータ削除で消える旨を UI 上で案内する（段階B導入までの制約）

---

## ■ 3. 新規お知らせ通知（Web Push）

### ■ 全体構成

```
[ブラウザ]
  ① ユーザー操作で通知許可
  ② Service Worker で PushSubscription 取得（VAPID 公開鍵）
  ③ 購読情報を API へ送信
              │
              ▼
[Cloudflare D1 / KV]  購読情報（endpoint・鍵・ロケール・通知設定）を保存
              ▲
              │
[通知送信 Worker（別 Worker）]
  ← WordPress 記事公開フック（PHP）から Webhook
  ← または Cron Trigger で定期チェック
  → 各ブラウザの Push Service へ送信
              │
              ▼
[Service Worker] push イベント → 通知表示 → notificationclick で記事へ遷移
```

### ■ 必要コンポーネント

| 要素 | 内容 |
|------|------|
| VAPID 鍵ペア | 公開鍵はフロントの環境変数、秘密鍵は Wrangler secret に保存 |
| 購読情報ストア | D1（条件絞り込みが必要なら）または KV。現状 `wrangler.jsonc` に未設定のため追加が必要 |
| 送信ライブラリ | `web-push`（npm）は Node.js 専用 API に依存し **Workers では動かない**。Web Crypto ベースの PushForge（`@pushforge/builder`）/ web-push-neo 等を使う |
| 送信トリガー | OpenNext 生成の `worker.js` へ Cron ハンドラを足すのは煩雑なため、**通知専用 Worker を分離**する。WordPress 側の公開フックから Webhook で叩く |
| Service Worker | `push` / `notificationclick` ハンドラ |

### ■ 購読データ構造（案）

```ts
type TPushSubscriptionRecord = {
  endpoint: string;          // 主キー
  keys: { p256dh: string; auth: string };
  locale: 'ja' | 'en';       // 通知文言・遷移先のロケール
  topics: string[];          // 例: ['movie', 'anime', 'vod:netflix']
  createdAt: string;
  lastSuccessAt?: string;
};
```

### ■ 対応環境

| 環境 | 通知 |
|------|------|
| Android Chrome / デスクトップ Chrome・Edge・Firefox | ブラウザのままで可（インストール不要） |
| macOS Safari | 可 |
| **iPhone / iPad** | **ホーム画面に追加した PWA のみ**（iOS 16.4+）。Safari のタブでは不可 |
| iOS / iPadOS 18.4+ | Declarative Web Push に対応。Service Worker なしでも通知表示でき、既存 Web Push と後方互換 |

### ■ 運用上の注意

- 通知許可ダイアログは**ボタン押下などユーザー操作起点**で出す。ページ表示直後の自動表示は拒否率が高く、ブラウザ側で抑制されることもある
- iOS 向けに「ホーム画面に追加」誘導 UI が必須
- 送信時に 404 / 410 が返った購読は失効とみなして削除する
- 通知過多対策: 送信頻度の上限、トピック単位の ON/OFF、通知設定画面
- 通知文言は購読時の `locale` に合わせて ja / en を出し分ける（ACF `lang` を正とする方針と揃える）
- 個人情報は保持しない（endpoint のみ）。プライバシーポリシー（`/privacy-policy`）へ通知に関する記載を追加する

---

## ■ 4. 既存構想との関係

[`vod_personalization_design.md`](vod_personalization_design.md) では以下が既に構想されている。

- VOD 契約情報を localStorage に保存
- Workers によるエピソード更新検知
- Service Worker による通知

本調査はこの構想の技術的実現性を裏付ける。VOD 契約フィルタは本書のお気に入り（段階A）と同じ localStorage 設計に乗せ、通知トピック（`vod:netflix` 等）として Web Push の購読条件に再利用できる。

---

## ■ 5. 推奨ロードマップ

| フェーズ | 規模 | 内容 |
|---------|------|------|
| 1 | 小 | manifest・アイコン・最小 SW（静的アセットのみキャッシュ）・オフラインフォールバックでインストール対応 |
| 2 | 小〜中 | localStorage ベースのお気に入り（`features/Favorite`）・お気に入り一覧ページ |
| 3 | 大 | Web Push（VAPID・D1・通知送信 Worker・WordPress Webhook・iOS 誘導 UI・通知設定） |
| 4 | 任意 | 認証導入によるお気に入り・通知設定の端末間同期 |

各フェーズの開始時に本書を `docs/develop/` へ移し、実装 Todo を追記する。

---

## ■ 6. 未決事項

- 通知のトリガー単位（全新着記事 / 投稿タイプ別 / VOD 別 / お気に入り作品の続編・新エピソード）
- 購読情報ストアを D1 と KV のどちらにするか
- 通知送信 Worker を本リポジトリ内に置くか別リポジトリにするか
- WordPress 側 Webhook の実装担当（テーマ / プラグイン）と認証方式（共有シークレット等）
- お気に入り一覧ページの URL と SSG / CSR の扱い

---

## ■ 参考資料

- [Next.js: Progressive Web Apps ガイド](https://unpkg.com/next@16.3.8/dist/docs/01-app/02-guides/progressive-web-apps.md)
- [Serwist / nextjs-pwa skill](https://skills.cat/skills/jakerains/agentskills/nextjs-pwa)
- [@ducanh2912/next-pwa](https://docsearch.algolia.com/mcp/docs/repo/ducanhgh/next-pwa)
- [PushForge](https://github.com/draphy/pushforge) / [@pushforge/builder](https://npmjs.com/package/@pushforge/builder)
- [web-push-neo](https://github.com/ryoppippi/web-push-neo)
- [WebKit: Meet Declarative Web Push](https://webkit.org/?p=16535)
- [PWA Push Notifications on iOS in 2026](https://webscraft.org/blog/pwa-pushspovischennya-na-ios-u-2026-scho-realno-pratsyuye?lang=en)
