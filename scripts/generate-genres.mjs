/**
 * ビルド前にジャンル一覧を WordPress REST API から取得し src/data/genres.json に書き出す。
 * getStaticProps 内の getGenres() 呼び出しを置き換え、Worker の CPU 時間を削減する。
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outputPath = path.join(rootDir, 'src/data/genres.json')

const WP_API_URL = process.env.WP_API_URL
if (!WP_API_URL) {
  console.warn('[generate-genres] WP_API_URL が未設定のため空配列を書き出します')
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify([]), 'utf8')
  process.exit(0)
}

const url = new URL(`${WP_API_URL}/genre`)
url.searchParams.set('per_page', '100')
url.searchParams.set('acf_format', 'standard')

let genres = []
try {
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  genres = Array.isArray(json) ? json : []
} catch (err) {
  console.warn(`[generate-genres] フェッチ失敗: ${err.message} — 空配列を書き出します`)
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, JSON.stringify(genres, null, 2), 'utf8')
console.log(`Generated ${path.relative(rootDir, outputPath)} (${genres.length} genres)`)
