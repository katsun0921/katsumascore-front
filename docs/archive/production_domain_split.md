# 本番ドメイン設計（公開サイト / CMS 専用 WordPress の分離）

> 目的: 本番公開に向け、ユーザー向けの正規 URL と WordPress（データ登録・REST・メディア取得元）のオリジンを分離する。  
> ステータス: 設計ドキュメント（DNS・WP 設定の具体値は運用確定後に追記する）

---

## 1. 方針サマリー

| # | 内容 |
|---|------|
| 1 | **ユーザー向けの公開サイト**は `https://katsumascore.blog/` とする。その向き先（オリジン）は **Cloudflare Workers 上の Next.js** とする。Workers の **workers.dev URL**（例: `https://katsumascore.sato-katsumasa.workers.dev/`）は同一アプリのデプロイ先であり、カスタムドメイン接続時の実体参照・検証用 URL として位置づける。 |
| 2 | **WordPress（投稿・固定ページ・ACF・メディアの登録専用）**は、**新規に取得する CMS 専用ドメイン**上で運用する（ConoHa Wing 上の同一 WP インスタンスでも、DNS で当てるホスト名が変わる想定）。 |
| 3 | フロント・SEO・ユーザー向けリンクの **正規オリジンは常に `https://katsumascore.blog`** とし、REST API や管理画面の URL に **CMS 専用ドメインが HTML 上に露出しない**よう環境変数・WP 設定・キャッシュルールを揃える。 |

---

## 2. 用語と役割

| 名称 | 例・プレースホルダ | 役割 |
|------|-------------------|------|
| **公開サイトオリジン** | `https://katsumascore.blog` | ブラウザが表示するサイト。canonical / OG / sitemap / 共有リンクの基準。Cloudflare で Workers にルーティング。 |
| **Workers 実URL** | `https://katsumascore.sato-katsumasa.workers.dev` | OpenNext デプロイの既定ホスト。DNS 未接続時の検証、CI・手動確認用。**一般ユーザー向けのブランド URL には使わない。** |
| **CMS / WP オリジン** | `https://<CMS専用FQDN>`（要決定） | `wp-admin`、REST（`/wp-json/...`）、アップロードメディアの **取得元**。サーバー間・ビルドパイプラインから参照。HTML に直書きしない。 |

> **記載ルール**: 本書では CMS 側のホストを **`WP_CMS_ORIGIN`** と表記する（実値は `.env` / Wrangler / 1Password 等で管理し、リポジトリには秘密情報として載せない）。

---

## 3. トラフィック構成（目標）

```
[ 一般ユーザー ]
      │
      ▼ HTTPS
https://katsumascore.blog/*
      │
      ▼（Cloudflare: Custom Domain → Worker）
[ Cloudflare Workers + Next.js ]
      │
      │ サーバーサイド fetch（WP REST）
      ▼
https://<WP_CMS_ORIGIN>/wp-json/wp/v2/...
      │
[ ConoHa Wing 上の WordPress + ACF ]
```

- **管理画面**は従来どおり **管理用サブドメイン**（例: `admin.katsumascore.blog`）を維持するか、**`WP_CMS_ORIGIN` 上の `wp-admin`** に集約するかはインフラ方針で決める。いずれにせよ、**一般読者向けページの HTML には `WP_CMS_ORIGIN` を出さない**。
- **`katsumascore.blog` 上に WordPress の PHP フロントを残さない**（または REST のみ・リダイレクトのみ）ことが、ユーザーから CMS ドメインを隠す前提となる。

---

## 4. 環境変数（フロント / Workers）

本リポジトリの慣例に合わせ、本番では次のように役割を分ける。

| 変数 | 設定値の目安 | 説明 |
|------|--------------|------|
| `WP_API_URL` | `https://<WP_CMS_ORIGIN>/wp-json/wp/v2`（末尾スラッシュなし） | **サーバー専用**。ISR・`getServerSideProps`・API Route から WP REST へ接続。 |
| `NEXT_PUBLIC_WP_BASE_URL` | `https://<WP_CMS_ORIGIN>` | **Next/Image やメディア URL の解決**に使う。ユーザーには `img` の `src` として露出しうるため、**CDN やプロキシで `katsumascore.blog` 経由の同一パスを返す**、または **WP 側でメディア URL を公開ドメインに書き換える**など、露出方針を別紙で固定する。 |
| `NEXT_PUBLIC_SITE_URL` | `https://katsumascore.blog` | canonical・OG・サイトマップ等の **公開正規 URL**。 |
| `NEXT_PUBLIC_SITE_NAME` | 従来どおり | 表示名。 |

詳細は [wordpress_production_env_secrets.md](../features/wordpress_production_env_secrets.md) および [cloudflare_workers_deploy.md](../features/cloudflare_workers_deploy.md) を参照。本ドキュメント確定後、それらの例示 URL を **`WP_CMS_ORIGIN` / `katsumascore.blog` の組み合わせ**に更新する。

### 4.1 `NEXT_PUBLIC_WP_BASE_URL` と「ユーザーから隠す」の両立

次のいずれか（または併用）を運用で選択する。

1. **メディア URL の正規化**  
   WP の「メディアの URL」や REST の `_embedded` 内リンクが **`WP_CMS_ORIGIN` のまま返る**場合、フロントで **オリジンだけ `NEXT_PUBLIC_SITE_URL` に置換**するレイヤーを持つ（既存の `normalizePosts` 系の責務に近い）。

2. **Cloudflare / リバースプロキシ**  
   `katsumascore.blog/wp-content/uploads/...` を Workers または別 Worker で **実体は `WP_CMS_ORIGIN` にフェッチ**し、ブラウザには常に `katsumascore.blog` を見せる。

3. **WordPress 側の `WP_HOME` / `WP_SITEURL`**  
   公開テーマを使わないヘッドレス運用に寄せ、`wp-config.php` または DB で **サイトアドレスを公開ドメインに**寄せる（REST の `link` ヘッダ等の挙動は要検証）。

採用案を決めたら、本節に **採用: (1)(2)(3)** と短い根拠を追記する。

---

## 5. WordPress 側チェックリスト

- [ ] **REST** が `WP_CMS_ORIGIN` で応答すること（認証が必要なエンドポイントは Workers の IP 制限や Application Password の運用と整合）。
- [ ] **CORS**: Workers からの `fetch` が失敗しないこと（ブラウザ直叩きは原則しないが、プレビュー用に緩む場合は最小限）。
- [ ] **固定ページ・投稿のパーマリンク**が、誤って一般ユーザーに `WP_CMS_ORIGIN` で配布されないこと（メール通知・RSS・デフォルトの `guid` 等）。
- [ ] **Webhook（ISR revalidate）** の送信元 URL が `WP_CMS_ORIGIN` でも `katsumascore.blog` でも Worker が受け付けるか、シークレット検証で担保。
- [ ] **検索エンジン**: `WP_CMS_ORIGIN` に `noindex`（`X-Robots-Tag` または `robots.txt`）を付与し、**インデックス対象は `katsumascore.blog` のみ**とする。

---

## 6. Cloudflare / DNS チェックリスト

- [ ] `katsumascore.blog`（および `www` が使う場合はそちらも）が **Workers カスタムドメイン**にバインドされている。
- [ ] `WP_CMS_ORIGIN` 用ゾーンで **ConoHa / オリジン** へのプロキシ設定が正しい。
- [ ] Cache Rules: **管理画面**は Bypass、`/wp-json/*` は Bypass 等、既存 [ARCHITECTURE.md](../ARCHITECTURE.md) の方針を **`WP_CMS_ORIGIN` ホストに複製**する。
- [ ] `workers.dev` は **本番リンクには使わない**（社内・CI のみ）。

---

## 7. リポジトリ内の追随更新（実施時）

ドメイン切替の実作業時に、少なくとも次を `katsumascore.blog`（公開）と `WP_CMS_ORIGIN`（CMS）の役割に合わせて見直す。

- `next.config.ts` の `images.remotePatterns`（メディアホスト）
- `SeoHead` / `sitemap` / `server-sitemap` の既定 `SITE_URL`
- ハードコードされた RSS（例: Footer の `feed` URL）— **公開ドメイン上の feed を指す**か、Next 側で生成するかを決める
- `.env.example`、各種 `docs/features/*.md` の curl 例
- `README.md` の本番デプロイ手順

---

## 8. 関連ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | 全体アーキテクチャ（§3 の図を本設計に合わせて更新予定） |
| [cloudflare_workers_deploy.md](../features/cloudflare_workers_deploy.md) | Wrangler・`NEXT_PUBLIC_SITE_URL` |
| [wordpress_production_env_secrets.md](../features/wordpress_production_env_secrets.md) | シークレット一覧 |
| [wordpress_production_api_verification.md](../features/wordpress_production_api_verification.md) | API 検証手順 |

---

## 9. 決定事項ログ（運用で埋める）

| 項目 | 値 |
|------|-----|
| CMS 専用 FQDN（`WP_CMS_ORIGIN`） | （未記入） |
| 管理画面 URL（`wp-admin`） | （未記入） |
| メディア露出方針（§4.1 の採用） | （未記入） |
| 切替日 / 担当 | （未記入） |

---

*KatsumaScore 本番ドメイン分離設計 ｜ 2026年5月4日*
