# Polylang REST `lang` 判定の現状整理（アーカイブ）

> **現行方針（2026-05）:** 本プロジェクトは **Polylang を使用しない**。記事の言語は **ACF の `lang` フィールド**を正とし、一覧は `normalizePosts` でフィルタする。以下は当時の切り分けメモとして残す。

---

> 対象（当時）: フェーズ 7 §2.1「`lang=ja` / `lang=en` で Polylang 想定どおり区別できる」

## 要約

本番 REST API で `lang` クエリを付与しても、`ja` と `en` の先頭投稿スラッグが一致するケースが継続している。  
現状は接続・ACF・ビルドは通っているが、多言語フィルタの期待動作は未確定。

---

## 観測した事実

- `npm run verify:wp-section2` は成功する
- ただし同スクリプトで次の警告が出る:

```text
verify-wp-section2: warning: first post slug identical for lang=ja and lang=en (...); check Polylang REST lang filter
```

- チェックリストでは、次の項目を未完了のまま保持している:
  - `lang=ja` / `lang=en` で Polylang 想定どおり区別できる

---

## 再現手順（最小）

```bash
WP_API_URL=https://katsumascore.blog/wp-json/wp/v2 npm run verify:wp-section2
```

直接確認:

```bash
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
curl -sS -A "$UA" "https://katsumascore.blog/wp-json/wp/v2/posts?per_page=1&lang=ja&_embed=1&acf_format=standard"
curl -sS -A "$UA" "https://katsumascore.blog/wp-json/wp/v2/posts?per_page=1&lang=en&_embed=1&acf_format=standard"
```

---

## 影響範囲

- API 接続性やビルド完走には直接影響しない
- ただし多言語ページのデータ整合性（想定言語の記事が返るか）に影響しうる
- `/posts/[slug]` の 404 調査とも関連する可能性があるため、優先的に切り分け対象

---

## 仮説

1. Polylang 側で REST 言語フィルタ設定が無効、または適用対象外
2. 他プラグイン/テーマで `lang` クエリが上書き・無視されている
3. 先頭1件比較だけでは偶然一致の可能性があり、件数比較が不足

---

## 調査結果（解決済み）

### 原因

`?lang=` REST フィルタは **Polylang Pro 専用機能**。Free プランでは `lang` / `translations` フィールドは REST レスポンスに含まれない（仕様）。

### 確認した事実

- `per_page=10` で `lang=ja` / `lang=en` を比較 → 完全一致（フィルタ不動作を確認）
- レスポンスの `lang: null`, `translations: null` → Free の制限であることを確認
- `pll/v1/languages` では `ja` / `en` の2言語登録は正常
- 日英は**別投稿として存在**（例: id=19747 ja, id=20345 en）
- Polylang は `link` フィールドで英語投稿に `/en/` プレフィックスを付与している
- WP HTML に `<link rel="alternate" hreflang>` を出力済み → 翻訳ペア取得に利用可能

### 実装方針（確定）

**Polylang Free のまま `link` パス判定で代替実装**

| 用途 | 実装 |
|---|---|
| 言語判定 | `detectLang(link)` — `/en/` プレフィックス有無で判定 |
| リスト分離 | `normalizePosts(posts, locale)` — 取得後フィルタ |
| 言語スイッチャー（将来）| `fetchTranslationLinks(postLink)` — SSG 時に HTML `hreflang` を解析 |

### 実装済みファイル

- `src/lib/api/wordpress/lang.ts` — `detectLang` / `fetchTranslationLinks`
- `src/lib/api/wordpress/schema.ts` — `WPPostSchema` に `link` 追加
- `src/lib/api/wordpress/transform.ts` — `mapParsedWPPostToPost` に `lang` 追加
- `src/types/post.ts` — `Post` 型に `lang?: "ja" | "en"` 追加
- `src/lib/utils/normalizePost.ts` — `normalizePosts` に locale フィルタ実装

### 将来 Polylang Pro に升格する場合

`detectLang` を REST レスポンスの `lang` フィールド読み取りに置換するだけ。コンポーネント以下は無修正。

---

## 関連

- [wordpress_production_api_verification.md](./wordpress_production_api_verification.md)
- [wordpress_production_api_verification_checklist.md](./wordpress_production_api_verification_checklist.md)
- [`scripts/verify-wp-section2.ts`](../../scripts/verify-wp-section2.ts)
