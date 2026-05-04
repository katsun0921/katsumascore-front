# Cloudflare Workers デプロイ手順（初回〜本番）

> 対象: `katsumascore-front`（Next.js + OpenNext + Cloudflare Workers）
> 作成: 2026-05-04

---

## 前提条件

- Node.js / npm インストール済み
- `npm install` 完了済み
- Cloudflare アカウント（`s.katsumasa@gmail.com`）

---

## Step 1 — wrangler ログイン

```bash
npx wrangler login
```

ブラウザが開くので「Allow」をクリック。完了後に確認：

```bash
npx wrangler whoami
# → "You are logged in with an OAuth Token, associated with the email s.katsumasa@gmail.com."
```

---

## Step 2 — 本番 URL の確定

### 2-1. workers.dev サブドメインを確認する

初回デプロイ前は URL が未確定のため、**仮 URL でデプロイして確認する**。

デプロイ後の URL パターン:

```
https://katsumascore.<workers-devサブドメイン>.workers.dev
```

> workers.dev サブドメインは Cloudflare ダッシュボード →
> **Workers & Pages → Overview → サブドメイン** で確認できる。

### 2-2. カスタムドメインを使う場合

Cloudflare ダッシュボード → Workers & Pages → `katsumascore` →
**Settings → Domains & Routes → Add Custom Domain** で設定する。

カスタムドメインを設定した場合は、その URL を `NEXT_PUBLIC_SITE_URL` に使う。

---

## Step 3 — `.env.local` を作成する

`.env.local` はコミットしない（`.gitignore` 済み）。

```bash
cp .env.example .env.local
```

`.env.local` を以下の本番値で編集する：

```env
# WordPress REST API（末尾スラッシュなし）
WP_API_URL=https://katsumascore.blog/wp-json/wp/v2

# WordPress サイト URL（画像・リンクのベース）
NEXT_PUBLIC_WP_BASE_URL=https://katsumascore.blog

# このサイトの本番 URL（Step 2 で確認した URL）
NEXT_PUBLIC_SITE_URL=https://katsumascore.<サブドメイン>.workers.dev

# サイト名
NEXT_PUBLIC_SITE_NAME=KatsumaScore

# ISR webhook シークレット（任意の強固な文字列）
REVALIDATE_SECRET=<ランダム文字列>

# --- 以下は WordPress 管理画面で値を確認して設定 ---
# WP_SEASONAL_REVIEW_PARENT_ID=
# WP_ANIME_CATEGORY_ID=
```

> `REVALIDATE_SECRET` の生成例:
> ```bash
> openssl rand -hex 32
> ```

---

## Step 4 — Cloudflare Workers に環境変数（Secrets）を登録する

**サーバーサイドの変数**（`NEXT_PUBLIC_` なし）は `wrangler secret put` で登録する。
**公開変数**（`NEXT_PUBLIC_`）は `wrangler.jsonc` の `vars` に記載する。

### 4-1. Secrets の登録（サーバーサイド）

```bash
npx wrangler secret put WP_API_URL
# → プロンプトに値を貼り付けて Enter

npx wrangler secret put REVALIDATE_SECRET
# → プロンプトに値を貼り付けて Enter
```

オプション変数（WordPress 管理画面で値を確認してから設定）:

```bash
npx wrangler secret put WP_SEASONAL_REVIEW_PARENT_ID
npx wrangler secret put WP_ANIME_CATEGORY_ID
```

### 4-2. 公開変数を `wrangler.jsonc` に追記する

`wrangler.jsonc` を編集：

```jsonc
{
  "name": "katsumascore",
  "compatibility_date": "2026-03-30",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "NEXT_PUBLIC_WP_BASE_URL": "https://katsumascore.blog",
    "NEXT_PUBLIC_SITE_URL": "https://katsumascore.<サブドメイン>.workers.dev",
    "NEXT_PUBLIC_SITE_NAME": "KatsumaScore"
  }
}
```

> `NEXT_PUBLIC_` 変数はビルド時に埋め込まれるため、`.env.local` の値が優先される。
> Cloudflare 側の `vars` はランタイム参照用として念のため登録する。

---

## Step 5 — 初回デプロイ

```bash
npm run deploy
```

内部で以下が実行される：

```
opennextjs-cloudflare build  # Next.js → Cloudflare Workers 向けビルド
wrangler deploy              # Cloudflare へアップロード
```

成功すると以下のような出力が出る：

```
✨ Deployment complete!
https://katsumascore.<サブドメイン>.workers.dev
```

---

## Step 6 — 本番 URL の更新（初回デプロイ後）

Step 5 で確認した URL を使って：

1. `.env.local` の `NEXT_PUBLIC_SITE_URL` を更新する
2. `wrangler.jsonc` の `vars.NEXT_PUBLIC_SITE_URL` を更新する
3. 再デプロイする：

```bash
npm run deploy
```

---

## Step 7 — 動作確認

### 主要ページの確認

| URL | 確認内容 |
|---|---|
| `/` | TOPページが表示されること |
| `/posts/[slug]` | 記事詳細が表示されること |
| `/anime` | アニメ一覧が表示されること |
| `/movie` | 映画一覧が表示されること |
| `/drama` | ドラマ一覧が表示されること |
| `/404` | 404ページが表示されること |

### API 接続確認

ブラウザの DevTools → Network タブで API エラーがないことを確認する。

### ISR Webhook の確認

```bash
curl -X POST https://katsumascore.<サブドメイン>.workers.dev/api/revalidate \
  -H "Authorization: Bearer <REVALIDATE_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"path": "/"}'
# → {"revalidated":true,"paths":["/"]} が返ること
```

---

## Step 8 — Secrets の登録確認

デプロイ後に登録済みシークレット一覧を確認：

```bash
npx wrangler secret list
```

---

## ローカルプレビュー（デプロイ前確認）

Cloudflare Workers 環境をローカルで再現する：

```bash
npm run preview
```

`http://localhost:8787` でアクセス可能。

> KV バインディングが必要な API はローカルプレビューでは動作しない場合がある。

---

## トラブルシューティング

### `Worker "katsumascore" not found`

初回デプロイ前に `wrangler secret list` などを実行すると出るエラー。
`npm run deploy` を先に実行すれば解消する。

### ビルドエラー（型エラー・lint エラー）

```bash
npm run lint
npx tsc --noEmit
```

で事前確認してからデプロイする。

### 環境変数が反映されない

- `NEXT_PUBLIC_` 変数はビルド時に埋め込まれるため、**値を変更したら再ビルド・再デプロイ**が必要。
- サーバーサイド変数（`WP_API_URL` 等）は `wrangler secret put` 後に再デプロイで反映される。

### WordPress API が 403 を返す（ConoHa WING）

**原因:** `.htaccess` で `curl` User-Agent をブロックしている場合、`curl` コマンドでのテストは 403 になる。ただし Cloudflare Workers の fetch は `curl` ではないため実際のサイトは正常に動作する。

```apache
# この行が curl コマンドによるテストをブロックする（Workers には影響なし）
SetEnvIfNoCase User-Agent "curl" bad_bot
```

**確認方法:** `curl` の代わりに User-Agent を指定してテストする。

```bash
curl -s -o /dev/null -w "%{http_code}" "https://katsumascore.blog/wp-json/wp/v2/posts?per_page=1" \
  -H "User-Agent: Mozilla/5.0 (compatible; Next.js)"
# → 200 が返れば API は正常
```

**ConoHa WING の海外アクセス制限について:**
- WAF・海外アクセス制限の REST-API チェックを外しても 403 が続く場合は `.htaccess` の User-Agent ブロックを疑う。
- Cloudflare Workers からのリクエスト自体は `curl` ではないため制限対象外。

---

## 関連ドキュメント

- [wordpress_production_api_verification.md](./wordpress_production_api_verification.md)
- [wordpress_production_api_verification_checklist.md](./wordpress_production_api_verification_checklist.md)
- [wordpress_production_env_secrets.md](./wordpress_production_env_secrets.md)
- [README.md](../../README.md)
