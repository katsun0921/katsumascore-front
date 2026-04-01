# src/pages/api/

Next.js API Routes（サーバーサイドエンドポイント）を管理するディレクトリ。

## ファイル構成

| ファイル | エンドポイント | 役割 |
|---|---|---|
| `vod.ts` | `GET /api/vod?slug={slug}` | VOD在庫情報を返すSSR API |
| `revalidate.ts` | `POST /api/revalidate` | ISR（Incremental Static Regeneration）再検証 |

## vod.ts の仕様

```ts
// レスポンス型
interface VodResponse {
  netflix: boolean
  amazon: boolean
  unext: boolean
  is_cinema: boolean
  updated_at: string | null
}
```

データ取得の優先順位:
1. Cloudflare KV（バインディング名: `VOD_CACHE`）から取得
2. KVに存在しない場合: WP REST APIのACFフィールドから取得
3. 両方失敗: 全フラグ `false` で返す（サービス継続優先）

## 注意事項

- KVバインディングは `wrangler.jsonc` に設定が必要
- `/api/vod` の動作確認は `npm run preview`（wrangler dev）で行う（`npm run dev` では KV が使えない）
