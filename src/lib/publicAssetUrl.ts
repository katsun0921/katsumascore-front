/**
 * `public/` 配下の静的ファイルパスを解決する。
 * Storybook を GitHub Pages のサブパス（例: /katsumascore-front/）で公開する場合も正しく解決する。
 * Next.js（ドメイン直下）では通常 `/images/...` のまま。
 * http(s) の絶対URLはそのまま返す。
 */
function viteBaseUrl(): string {
  try {
    const env = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env
    const base = env?.BASE_URL
    if (typeof base === 'string') return base
  } catch {
    /* non-Vite */
  }
  return '/'
}

export function publicAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const clean = path.startsWith('/') ? path : `/${path}`
  const base = viteBaseUrl()
  if (base !== '/' && base !== '') {
    return `${base.replace(/\/$/, '')}${clean}`
  }
  return clean
}
