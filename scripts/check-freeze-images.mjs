/**
 * SSG 凍結ビルドの生成物（`.open-next/cache`）に、ブラウザが WP へ取りにいく画像参照が残っていないか検査する。
 *
 * 許容（取得されない）: `<meta>`（OGP 等）、JSON-LD、`__NEXT_DATA__`、`<a href>`、ページデータ JSON。
 * 違反（取得される）: `<img>` / `<source>` / `<video>` / `<link>` / `<iframe>` など、`<a>` と `<meta>` 以外のタグが
 *   `wp-content` を属性に持つもの（`srcset`・`style` の `url()` を含む）、および `<style>` 内の `url(.../wp-content/...)`。
 * 違反があれば種類別の件数と例を出して終了コード 1 で終わる。
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const cacheDir = path.resolve(process.cwd(), '.open-next/cache')
const NEEDLE = 'wp-content'
const ALLOWED_TAGS = new Set(['a', 'meta'])

/** `__fetch` を除く `.cache` ファイルを再帰的に集める。 */
const collect = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (e) => {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) return e.name === '__fetch' ? [] : collect(p)
      return e.name.endsWith('.cache') ? [p] : []
    }),
  )
  return nested.flat()
}

const files = await collect(cacheDir)
const allowed = new Map()
const violations = new Map()
const examples = new Map()
const filesWithViolation = new Set()

/** 件数を加算する。 */
const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1)

for (const file of files) {
  const entry = JSON.parse(await readFile(file, 'utf8'))
  const html = typeof entry.html === 'string' ? entry.html : ''
  if (!html.includes(NEEDLE)) continue

  // JSON-LD / __NEXT_DATA__ などの script 本文は取得されない文字列なので、除いてから走査する
  const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => {
    if (m.includes(NEEDLE)) bump(allowed, 'script（JSON-LD / __NEXT_DATA__）')
    return ''
  })

  // style ブロック内の url(...)
  for (const m of withoutScripts.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (m[1].includes(NEEDLE)) {
      bump(violations, 'style ブロックの url()')
      filesWithViolation.add(file)
    }
  }

  for (const m of withoutScripts.matchAll(/<([a-zA-Z][\w-]*)\b[^>]*>/g)) {
    const tag = m[0]
    if (!tag.includes(NEEDLE)) continue
    const name = m[1].toLowerCase()
    if (ALLOWED_TAGS.has(name)) {
      bump(allowed, `<${name}>`)
      continue
    }
    const key = `<${name}>`
    bump(violations, key)
    filesWithViolation.add(file)
    if (!examples.has(key)) examples.set(key, [])
    if (examples.get(key).length < 3) examples.get(key).push(`${path.relative(cacheDir, file)}: ${tag.slice(0, 200)}`)
  }
}

console.log(`[check-freeze-images] 検査したページ: ${files.length}`)
console.log('[check-freeze-images] 許容（取得されない参照）:')
for (const [k, n] of [...allowed.entries()].sort()) console.log(`  ${k}: ${n}`)
if (violations.size === 0) {
  console.log('[check-freeze-images] OK: WP へ取りにいく画像参照は見つかりませんでした')
  process.exit(0)
}
console.error('[check-freeze-images] NG: WP へ取りにいく可能性のある参照')
for (const [k, n] of [...violations.entries()].sort()) {
  console.error(`  ${k}: ${n}`)
  for (const ex of examples.get(k) ?? []) console.error(`    例) ${ex}`)
}
console.error(`[check-freeze-images] 該当ページ数: ${filesWithViolation.size}`)
process.exit(1)
