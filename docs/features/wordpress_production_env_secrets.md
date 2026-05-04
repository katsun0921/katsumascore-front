# WordPress 本番環境変数・シークレット運用（フェーズ 7 §1）

> 対象: [wordpress_production_api_verification_checklist.md](./wordpress_production_api_verification_checklist.md) の「1. 本番環境変数・シークレット」

## 目的

本番 API 接続確認で使う環境変数を、**漏えいなく**・**環境ごとに整合した値で**運用する。

---

## 設定対象（本番）

| 変数 | 役割 | 既定/備考 |
|------|------|-----------|
| `WP_API_URL` | WordPress REST ベース URL | `https://katsumascore.blog/wp-json/wp/v2`（末尾スラッシュなし） |
| `NEXT_PUBLIC_WP_BASE_URL` | WP 公開 URL（画像・リンク） | `https://katsumascore.blog` |
| `NEXT_PUBLIC_SITE_URL` | フロント正規 URL（canonical/OG） | 本番公開 URL |

季節レビュー親スラッグ・カテゴリスラッグ・`genre` / `vod` の REST パスは **環境変数ではなく** [`src/config/wpContent.config.ts`](../../src/config/wpContent.config.ts) で固定。本番 WP と差が出たらそのファイルを編集する。

---

## 設定手順（推奨順）

1. **値のソースを固定**  
   WordPress 管理画面で、カテゴリ/固定ページの ID・slug を採番して記録し、`wpContent.config.ts` の固定値と整合する。
2. **デプロイ先の環境変数を設定**  
   Production/Preview を分けて登録する（同名でも値は別管理）。
3. **ローカル `.env.local` は本番値を直書きしない**  
   本番確認時はシェルで一時的に export する。
4. **接続確認を実行**  
   `npm run verify:wp-api` → `npm run verify:wp-section2` → `npm run build`。

---

## セキュリティ運用

- `.env*` は Git に含めない（本リポジトリは `.gitignore` 済み）。
- 画面共有・ログ出力時に URL/ID を必要以上に貼らない。
- シークレット更新時は、古い値を無効化してから再デプロイ。
- CI のログに環境変数が露出しない設定を維持する（mask）。

---

## 変更時チェック（§1 と対応）

- [ ] `WP_API_URL` / `NEXT_PUBLIC_WP_BASE_URL` / `NEXT_PUBLIC_SITE_URL` が本番値
- [ ] `wpContent.config.ts` のスラッグ・REST パスが本番 WordPress と一致
- [ ] 変数値がコードやドキュメント本文に誤コミットされていない

---

## 関連

- [wordpress_production_api_verification.md](./wordpress_production_api_verification.md)
- [wordpress_production_api_verification_checklist.md](./wordpress_production_api_verification_checklist.md)
- [`.env.example`](../../.env.example)
