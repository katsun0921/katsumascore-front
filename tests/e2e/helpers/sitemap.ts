/**
 * sitemap.xml から <loc> タグの URL を全件取得する。
 * E2E テストの対象 URL リストとして使用する。
 */
export const fetchSitemapUrls = async (sitemapUrl: string): Promise<string[]> => {
  const res = await fetch(sitemapUrl)
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status} ${sitemapUrl}`)
  const xml = await res.text()
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  return matches.map((m) => m[1].trim())
}
