import { test, expect } from '@playwright/test'
import { fetchSitemapUrls } from './helpers/sitemap'
import { FORBIDDEN_PATTERNS } from './helpers/forbidden'
import { findUrlsInJsonLd, extractSrcsetUrls } from './helpers/jsonld'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog'

/** サイトマップの URL のオリジンをテスト対象の SITE_URL に書き換える */
const rewriteOrigin = (url: string): string => {
  try {
    const parsed = new URL(url)
    const base = new URL(SITE_URL)
    parsed.protocol = base.protocol
    parsed.host = base.host
    return parsed.toString()
  } catch {
    return url
  }
}

test.describe('URL Leak Detection', () => {
  let urls: string[] = []

  test.beforeAll(async () => {
    const raw = await fetchSitemapUrls(`${SITE_URL}/sitemap.xml`)
    urls = raw.map(rewriteOrigin)
  })

  test('レンダリング済み HTML に CMS オリジンが含まれていない', async ({ page }) => {
    const leaks: { url: string; matches: string[] }[] = []

    for (const url of urls) {
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      const html = await page.content()

      // srcset / JSON-LD を含む全域を対象にする
      const jsonLdUrls = findUrlsInJsonLd(html)
      const srcsetUrls = extractSrcsetUrls(html)
      const fullText = [html, ...jsonLdUrls, ...srcsetUrls].join('\n')

      const matches: string[] = []
      for (const pattern of FORBIDDEN_PATTERNS) {
        const found = fullText.match(new RegExp(pattern.source, 'gi'))
        if (found) matches.push(...found)
      }

      if (matches.length > 0) {
        leaks.push({ url, matches: [...new Set(matches)] })
      }
    }

    if (leaks.length > 0) {
      console.error('URL leaks detected:', JSON.stringify(leaks, null, 2))
    }

    expect(leaks).toHaveLength(0)
  })

  test('sitemap.xml に CMS オリジンが含まれていない', async ({ request }) => {
    const res = await request.get(`${SITE_URL}/sitemap.xml`)
    const xml = await res.text()
    for (const pattern of FORBIDDEN_PATTERNS) {
      expect(xml).not.toMatch(pattern)
    }
  })

  test('feed に CMS オリジンが含まれていない', async ({ request }) => {
    const res = await request.get(`${SITE_URL}/feed`)
    const xml = await res.text()
    for (const pattern of FORBIDDEN_PATTERNS) {
      expect(xml).not.toMatch(pattern)
    }
  })

  test('x-normalize-version が最新バージョンと一致する', async ({ request }) => {
    const expected = process.env.EXPECTED_NORMALIZE_VERSION
    if (!expected) {
      test.skip()
      return
    }
    const res = await request.get(`${SITE_URL}/`)
    const v = res.headers()['x-normalize-version']
    expect(v).toBe(expected)
  })
})
