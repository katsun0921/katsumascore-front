/** WP取得失敗の応答を固定の分類値へ変換する。本文・URL・任意のヘッダー値は出力しない。 */

/** 応答本文を最大16KiBだけ読み、巨大なエラーページでも読み取りを打ち切る。 */
const readBodyPrefix = async (response) => {
  if (!response.body) return ''
  const reader = response.body.getReader()
  const chunks = []
  let remaining = 16 * 1024
  try {
    while (remaining > 0) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = value.subarray(0, remaining)
      chunks.push(chunk)
      remaining -= chunk.byteLength
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
  return Buffer.concat(chunks).toString('utf8')
}

/**
 * 許可済みの固定値と真偽値だけを返す。本文にトークンやCookieが反射されても記録しない。
 * Cloudflare経由という手掛かりと遮断元の確定は別であり、複数の候補をそのまま返す。
 */
export const getWpResponseDiagnostics = async (response) => {
  const server = response.headers.get('server')?.toLowerCase() ?? ''
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  const body = await readBodyPrefix(response).catch(() => '')
  return {
    status: response.status,
    serverHints: ['cloudflare', 'nginx', 'apache', 'litespeed', 'openresty'].filter((name) => server.includes(name)),
    contentTypeHints: ['text/html', 'application/json', 'text/plain'].filter((name) => contentType.includes(name)),
    hasCfRay: response.headers.has('cf-ray'),
    cloudflareChallenge: response.headers.get('cf-mitigated') === 'challenge',
    bodyHints: {
      cloudflare: /cloudflare|cf-ray|cf-chl-/i.test(body),
      conoha: /conoha/i.test(body),
      forbiddenAccess: /forbidden\s+access|閲覧できません/i.test(body),
      wordpressRestError: /"code"\s*:\s*"rest_[a-z_]+"/i.test(body),
    },
  }
}
