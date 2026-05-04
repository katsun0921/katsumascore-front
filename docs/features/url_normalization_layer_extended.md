# URL正規化レイヤー設計（最終拡張版 +α）

## ■ 追加拡張（本ドキュメント）
- ④ キャッシュ戦略（ISR × Edge Cache 整合）
- ⑤ E2Eテスト（HTML内URL検査）対策
- ⑥ 全体フロー（拡張版）
- ⑦ 結論（最終版）

> 既存の 3 層防御（normalize / Zod / middleware）は完成済み。
> 本追記は「キャッシュされた瞬間に固定化される」リスクと、
> 「漏れていないことを機械的に証明する」運用を補完するもの。

---

# ■ ④ キャッシュ戦略（ISR × Edge Cache 整合）

## ■ 背景

URL 正規化はレンダリング時に確定する。
つまり**正規化後の HTML がそのままキャッシュ対象**になる。

このため、以下の状況では「古い正規化結果」が露出するリスクがある：

- normalize ロジックを改修した直後（旧 HTML が Edge に残存）
- WP_ORIGIN を変更した（全キャッシュが古い参照を保持）
- 記事を更新した（ISR は再生成しても Edge は旧版を返す）

→ **「ISR」と「Edge Cache」の整合性確保が必須**。

## ■ キャッシュ階層図

```
[Browser]
   ↓ Cache-Control
[Cloudflare Edge Cache]   ← Cache Rules / Workers Cache API
   ↓
[Next.js Full Route Cache]  ← ISR (revalidate)
   ↓
[Next.js Data Cache]   ← fetch revalidate
   ↓
[WordPress REST API]   ← Origin
```

各層の TTL とパージ条件を整合させる。

## ■ 各層の役割と TTL 設計

| 層 | 種別 | TTL | 無効化トリガ |
|----|------|-----|------------|
| WP Origin | HTTP Cache | 0（無効） | - |
| Next Data Cache | fetch revalidate | 60s | 時間経過 |
| Next Route Cache | ISR | 300s | `res.revalidate()` |
| Cloudflare Edge | Cache Rules | 1h（s-maxage） | Cache Purge API |
| Browser | Cache-Control | 0（must-revalidate） | - |

> **原則**：内側ほど短く、外側ほど長く。
> 外側を確実にパージできる仕組みを必ず用意する。

## ■ Cache Key 設計

normalize のバージョンを Cache Key に含めることで、
ロジック更新時に旧キャッシュを**自動的に無効化**する。

```ts
// lib/cache/version.ts
export const NORMALIZE_VERSION = 'v3'
```

Cloudflare Workers 側：

```ts
const cache = caches.default
const url = new URL(request.url)
url.searchParams.set('__nv', NORMALIZE_VERSION)

const cacheKey = new Request(url.toString(), request)
```

**メリット**：
- normalize 改修 → version up → 全 Edge が自動失効
- パージ忘れによる旧 URL 露出を**構造的に防止**
- 巻き戻し時も version を戻せば旧キャッシュにヒット可能

## ■ revalidate 戦略

### ■ 時間ベース（fallback）

```ts
export async function getStaticProps({ params }) {
  const post = await fetchWPValidated(
    `/posts/${params.slug}`,
    WPPostSchema
  )
  return {
    props: { post },
    revalidate: 300, // 5min
  }
}
```

5 分の遅延は許容できる範囲だが、
**記事公開直後の確実な反映には不十分**。

### ■ On-Demand Revalidation（推奨）

WordPress 側で `save_post` をフックし、Next.js の API Route を叩く。

WP 側（functions.php）：

```php
add_action('save_post', function ($post_id) {
    if (wp_is_post_revision($post_id)) return;
    if (get_post_status($post_id) !== 'publish') return;

    $slug = get_post($post_id)->post_name;
    $url  = sprintf(
      '%s/api/revalidate?slug=%s&secret=%s',
      'https://katsumascore.blog',
      $slug,
      REVALIDATE_SECRET
    );
    wp_remote_get($url, ['blocking' => false, 'timeout' => 1]);
});
```

Next.js 側（pages/api/revalidate.ts）：

```ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ error: 'invalid token' })
  }

  const slug = String(req.query.slug)

  try {
    // 1. Next ISR 再生成
    await res.revalidate(`/posts/${slug}`)
    await res.revalidate('/') // TOP も連動

    // 2. Cloudflare Edge Cache パージ
    await purgeCloudflare([
      `https://katsumascore.blog/posts/${slug}`,
      `https://katsumascore.blog/`,
    ])

    return res.json({ revalidated: true, slug })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
```

### ■ Cloudflare Cache Purge

```ts
async function purgeCloudflare(urls: string[]) {
  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: urls }),
    }
  )
}
```

## ■ Cache-Control ヘッダ設計

ページ種別ごとに最適化する。

| ページ種別 | Cache-Control |
|----------|---------------|
| 記事ページ | `public, s-maxage=3600, stale-while-revalidate=86400` |
| TOP ページ | `public, s-maxage=300, stale-while-revalidate=600` |
| カテゴリ一覧 | `public, s-maxage=600, stale-while-revalidate=1800` |
| RSS / sitemap | `public, s-maxage=1800` |
| 検索結果 | `private, no-cache` |
| プレビュー | `private, no-store` |

`stale-while-revalidate` により、
**期限切れでも一旦旧版を返しつつ裏で更新**できるため、
ユーザー体感速度は維持される。

## ■ 整合性確保パターン

### ■ ① Atomic Purge（normalize 改修時の手順）

```bash
1. 新 normalize.ts をデプロイ
2. NORMALIZE_VERSION を up（v3 → v4）
3. Cloudflare Cache 全パージ
4. ISR 強制再生成（warm-up クローラ）
```

### ■ ② Warm-up クローラ

デプロイ直後に主要 URL を一斉アクセスして、
新しいキャッシュを事前に温める。

```ts
// scripts/warmup.ts
const urls = await fetchSitemap('https://katsumascore.blog/sitemap.xml')
const top = urls.slice(0, 50) // 上位50URLのみ
await Promise.all(
  top.map((u) => fetch(u, { cache: 'no-cache' }))
)
```

### ■ ③ 不整合検知（debug header）

レスポンスに version ヘッダを埋め込み、E2E から監視可能にする。

```ts
res.setHeader('x-normalize-version', NORMALIZE_VERSION)
```

旧 version のレスポンスが返ってきたら**Edge にゴーストが残っている**。

## ■ 注意点

- ISR + Edge の二重 TTL は **外側が長すぎると ISR の意味が消える**
- Cloudflare の `Cache Everything` ルールは **Cookie の有無で挙動が変わる**ため、ログイン Cookie をバイパスする条件を明記
- プレビューは必ず `private, no-store`（プレビュー Cookie でリーク防止）
- `revalidateTag` は App Router 限定。**Pages Router では `res.revalidate()` を使う**
- Cloudflare の Purge API は **30 URL / 1 リクエスト** 制限あり。多数パージ時は分割

---

# ■ ⑤ E2Eテスト（HTML内URL検査）対策

## ■ 目的

> **「正規化が漏れていないか」を本番直前と本番運用で機械的に検証する。**

3 層防御でも、新規エンドポイント追加・rich text 内の予期せぬパターン・
プラグイン由来のショートコード展開などで漏れる可能性がある。

E2E で **最終確認**する。

## ■ 検査対象

レンダリング後 HTML に対して以下を網羅。

| 領域 | 検査対象 |
|------|---------|
| リンク | `<a href>` |
| 画像 | `<img src>`, `srcset`, `<picture><source srcset>` |
| メタ | `<link href>`（canonical, alternate, preload） |
| OGP | `<meta property="og:url">`, `og:image`, `twitter:image` |
| 構造化データ | `<script type="application/ld+json">` 内の URL |
| インライン | `style` 属性内の `url(...)` |
| data 属性 | `data-src`, `data-href` 等の遅延ロード系 |
| iframe | `<iframe src>` |
| script | `<script src>` |
| sitemap | `/sitemap.xml` 内の `<loc>` |
| RSS | `/feed` 内の `<link>`, `<guid>` |

## ■ 検出ルール

```ts
// tests/e2e/helpers/forbidden.ts
export const FORBIDDEN_PATTERNS = [
  /https?:\/\/wp\.katsumascore\.blog/i,             // WP origin
  /https?:\/\/[^\/]*\.wp\.katsumascore\.blog/i,     // sub
  /https?:\/\/[a-z0-9-]+\.conoha\.io/i,             // ConoHa internal
  /\/wp-content\/uploads\/(?!.*katsumascore\.blog)/i, // 相対漏れ
]
```

**1 件でもヒットしたら fail**。

## ■ Playwright 実装

`tests/e2e/url-leak.spec.ts`：

```ts
import { test, expect } from '@playwright/test'
import { fetchSitemapUrls } from './helpers/sitemap'
import { FORBIDDEN_PATTERNS } from './helpers/forbidden'

test.describe('URL Leak Detection', () => {
  let urls: string[] = []

  test.beforeAll(async () => {
    urls = await fetchSitemapUrls(
      'https://katsumascore.blog/sitemap.xml'
    )
  })

  test('no CMS origin in any rendered page', async ({ page }) => {
    const leaks: { url: string; matches: string[] }[] = []

    for (const url of urls) {
      await page.goto(url, { waitUntil: 'networkidle' })
      const html = await page.content()

      const matches: string[] = []
      for (const pattern of FORBIDDEN_PATTERNS) {
        const found = html.match(new RegExp(pattern, 'gi'))
        if (found) matches.push(...found)
      }

      if (matches.length > 0) {
        leaks.push({ url, matches: [...new Set(matches)] })
      }
    }

    if (leaks.length > 0) {
      console.error(
        '🚨 URL leaks detected:',
        JSON.stringify(leaks, null, 2)
      )
    }

    expect(leaks).toHaveLength(0)
  })
})
```

## ■ 構造化データの個別検査

JSON-LD は文字列マッチで取りこぼす可能性があるため、
**パースして再帰的に走査**する。

```ts
// tests/e2e/helpers/jsonld.ts
export function findUrlsInJsonLd(html: string): string[] {
  const scripts = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  ) || []

  const urls: string[] = []
  for (const script of scripts) {
    const json = script.replace(/<[^>]+>/g, '')
    try {
      const data = JSON.parse(json)
      walk(data, (v) => {
        if (typeof v === 'string' && /^https?:\/\//.test(v)) {
          urls.push(v)
        }
      })
    } catch {
      // JSON parse 失敗は無視（別テストで検出）
    }
  }
  return urls
}

function walk(obj: unknown, fn: (v: unknown) => void) {
  if (Array.isArray(obj)) obj.forEach((v) => walk(v, fn))
  else if (obj && typeof obj === 'object')
    Object.values(obj).forEach((v) => walk(v, fn))
  else fn(obj)
}
```

## ■ srcset の個別検査

`srcset` は複数 URL をカンマで含むため、必ず分解して**全要素を検証**する。

```ts
export function extractSrcsetUrls(html: string): string[] {
  const matches = [...html.matchAll(/srcset="([^"]+)"/g)]
  return matches.flatMap((m) =>
    m[1].split(',').map((s) => s.trim().split(/\s+/)[0])
  )
}
```

## ■ sitemap / feed の検査

HTML だけでなく **XML エンドポイント**も対象に含める。
（クローラとリーダーがここから URL を拾うため、漏れの影響が大きい）

```ts
test('sitemap.xml has no CMS origin', async ({ request }) => {
  const res = await request.get('https://katsumascore.blog/sitemap.xml')
  const xml = await res.text()
  for (const p of FORBIDDEN_PATTERNS) {
    expect(xml).not.toMatch(p)
  }
})

test('feed has no CMS origin', async ({ request }) => {
  const res = await request.get('https://katsumascore.blog/feed')
  const xml = await res.text()
  for (const p of FORBIDDEN_PATTERNS) {
    expect(xml).not.toMatch(p)
  }
})
```

## ■ NORMALIZE_VERSION ゴースト検知

Edge から取得したレスポンスの `x-normalize-version` ヘッダが
最新と一致しない場合は **キャッシュゴースト**。

```ts
test('no stale normalize version', async ({ request }) => {
  const res = await request.get('https://katsumascore.blog/')
  const v = res.headers()['x-normalize-version']
  expect(v).toBe(process.env.EXPECTED_NORMALIZE_VERSION)
})
```

## ■ CI 統合（GitHub Actions）

`.github/workflows/url-leak-check.yml`：

```yaml
name: URL Leak Check

on:
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Build
        run: npm run build
        env:
          WP_API_URL: ${{ secrets.WP_API_URL }}

      - name: Start
        run: npm run start &

      - name: Wait
        run: npx wait-on http://localhost:3000

      - name: Run URL leak test
        run: npx playwright test tests/e2e/url-leak.spec.ts

      - name: Upload report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

**マージブロック条件**：このテストが fail したら main にマージ不可。

## ■ 本番カナリア（Synthetic Monitoring）

デプロイ後・運用中の監視。

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # 6時間ごと
```

主要 10URL に絞って実行（全 URL 走査は不要）：

- TOP
- 最新記事 3 本
- カテゴリ一覧 3 本
- About / Privacy
- sitemap.xml

検出時は Discord Webhook で通知。

```ts
async function notifyDiscord(leaks: unknown) {
  await fetch(process.env.DISCORD_WEBHOOK!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content:
        `🚨 URL Leak detected on production:\n` +
        '```json\n' +
        JSON.stringify(leaks, null, 2) +
        '\n```',
    }),
  })
}
```

## ■ 失敗時の運用フロー

```
1. CI fail / カナリア検知
   ↓
2. 漏れたパスを特定（Playwright レポート）
   ↓
3. normalize 関数の対応抜け or 新フィールド追加を判断
   ↓
4. 修正 → NORMALIZE_VERSION up
   ↓
5. デプロイ → Cloudflare Cache 全パージ
   ↓
6. Warm-up クローラ実行
   ↓
7. カナリア再実行で確認
```

## ■ 検査の網羅性指標

```
カバレッジ目標：
- sitemap 記載 URL の 100%（CI 時）
- 主要 10URL（カナリア時）
- 各テンプレート（post / page / category / tag / search / 404）を最低 1 ページずつ
- 主要記事タイプ（レビュー / 特集 / VOD 一覧）を網羅
```

---

# ■ ⑥ 全体フロー（拡張版）

```
┌─────────────────────────────────────────────────┐
│                  WordPress (Origin)              │
│   - REST API                                     │
│   - save_post → /api/revalidate を hit          │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│          fetchWPValidated（Layer 1+2）           │
│   - normalize URL                                │
│   - Zod parse                                    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│      Next.js（ISR / getServerSideProps）         │
│   - revalidate 300s                              │
│   - res.revalidate() on demand                   │
│   - x-normalize-version ヘッダ付与               │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│      Cloudflare Workers（Layer 3）               │
│   - HTML rewrite 最終ガード                      │
│   - NORMALIZE_VERSION 付き Cache Key            │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│      Cloudflare Edge Cache                       │
│   - s-maxage / SWR                               │
│   - Purge API（On-Demand）                      │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│      Browser                                     │
└─────────────────────────────────────────────────┘

         ▲
         │
┌────────┴────────────────────────────────────────┐
│      E2E URL Leak Check                          │
│   - PR 時：sitemap 全 URL 走査                   │
│   - 本番：6 時間ごとカナリア                     │
│   - 失敗 → Discord 通知                          │
└─────────────────────────────────────────────────┘
```

---

# ■ ⑦ 結論（最終版）

| 観点 | 担保レイヤー |
|------|-------------|
| URL 正規化 | normalize / Zod / middleware（3 層） |
| 鮮度 | ISR + On-Demand Revalidation |
| 配信効率 | Cloudflare Edge Cache + SWR |
| 整合性 | NORMALIZE_VERSION cache key + Atomic Purge |
| 監視 | E2E URL Leak Check（CI + 本番カナリア） |

**設計原則**：

- 防御は重ねる（多層防御）
- キャッシュは**外側を必ずパージできる仕組み**で管理する
- 「漏れていないこと」を**機械的に証明する**

> URL 正規化は **インフラ × セキュリティ × オブザーバビリティ** の三位一体。
