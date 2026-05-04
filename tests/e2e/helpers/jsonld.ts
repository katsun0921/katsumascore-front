/**
 * HTML 内の JSON-LD ブロックを再帰的に走査し、URL 文字列を全件抽出する。
 * 文字列マッチでは取りこぼす可能性があるため、パースして走査する。
 */
export const findUrlsInJsonLd = (html: string): string[] => {
  const scripts =
    html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    ) ?? []

  const urls: string[] = []
  for (const script of scripts) {
    const json = script.replace(/<[^>]+>/g, '')
    try {
      const data: unknown = JSON.parse(json)
      walk(data, (v) => {
        if (typeof v === 'string' && /^https?:\/\//.test(v)) {
          urls.push(v)
        }
      })
    } catch {
      // JSON parse 失敗は別テストで検出するため無視する
    }
  }
  return urls
}

const walk = (obj: unknown, fn: (v: unknown) => void): void => {
  if (Array.isArray(obj)) {
    obj.forEach((v) => walk(v, fn))
  } else if (obj !== null && typeof obj === 'object') {
    Object.values(obj).forEach((v) => walk(v, fn))
  } else {
    fn(obj)
  }
}

/**
 * srcset 属性からすべての URL を抽出する。
 * srcset はカンマ区切りで複数 URL を含むため分解して検査する。
 */
export const extractSrcsetUrls = (html: string): string[] => {
  const matches = [...html.matchAll(/srcset="([^"]+)"/g)]
  return matches.flatMap((m) =>
    m[1].split(',').map((s) => s.trim().split(/\s+/)[0])
  )
}
