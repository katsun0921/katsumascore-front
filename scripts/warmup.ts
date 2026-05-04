/**
 * デプロイ直後に主要 URL を一斉アクセスし、Edge キャッシュを事前に温める。
 * sitemap.xml から URL を取得して上位 50 件をフェッチする。
 *
 * 使い方: npx tsx scripts/warmup.ts
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog'
const TOP_N = 50

/** sitemap.xml から <loc> タグ内の URL を全件取得する */
const fetchSitemapUrls = async (sitemapUrl: string): Promise<string[]> => {
  const res = await fetch(sitemapUrl)
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`)
  const xml = await res.text()
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  return matches.map((m) => m[1].trim())
}

const warmup = async () => {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`
  console.log(`Fetching sitemap: ${sitemapUrl}`)

  const urls = await fetchSitemapUrls(sitemapUrl)
  const top = urls.slice(0, TOP_N)

  console.log(`Warming up ${top.length} URLs...`)

  const results = await Promise.allSettled(
    top.map((url) =>
      fetch(url, { cache: 'no-cache' }).then((r) => ({
        url,
        status: r.status,
      }))
    )
  )

  let ok = 0
  let fail = 0
  for (const r of results) {
    if (r.status === 'fulfilled') {
      console.log(`  ✓ ${r.value.status} ${r.value.url}`)
      ok++
    } else {
      console.error(`  ✗ ${r.reason}`)
      fail++
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`)
}

warmup().catch((e) => {
  console.error(e)
  process.exit(1)
})
