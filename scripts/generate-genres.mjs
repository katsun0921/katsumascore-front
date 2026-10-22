/**
 * ビルド前にジャンル一覧を WordPress REST API から取得し src/data/genres.json に書き出す。
 * getStaticProps 内の getGenres() 呼び出しを置き換え、Worker の CPU 時間を削減する。
 */
import { access, mkdir, writeFile } from 'node:fs/promises'
import nextEnv from '@next/env'
import { wpFetch } from '../src/libs/api/wordpress/transport.ts'
nextEnv.loadEnvConfig(process.cwd())
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outputPath = path.join(rootDir, 'src/data/genres.json')

// WAF移行前は継続し、トークンを登録したビルドから厳格化する。
/** 生成済みファイルが無いときだけ空配列を書く（ファイル欠如を避け、既存の実データは上書きしない）。 */
const ensureFallbackFile = async () => {
  try {
    await access(outputPath)
  } catch {
    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, JSON.stringify([]), 'utf8')
    console.warn('[generate-genres] genres.json が無いため空配列を書き出しました（ジャンルナビは空になります）')
  }
}

const required = process.argv.includes('--required') && Boolean(process.env.WP_BUILD_TOKEN?.trim())
const WP_API_URL = process.env.WP_API_URL
if (!WP_API_URL) {
  if (required) throw new Error('WP_API_URL is required to generate genres')
  console.log('[generate-genres] WP_API_URL未設定。既存ジャンルを維持します')
  await ensureFallbackFile()
  process.exit(0)
}

const url = new URL(`${WP_API_URL}/genre`)
url.searchParams.set('per_page', '100')
url.searchParams.set('acf_format', 'standard')

let genres = []
try {
  const res = await wpFetch(url.toString())
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (!Array.isArray(json)) throw new Error('WP genre response is not an array')
  genres = json
} catch (err) {
  if (required) throw new Error(`generate-genres failed: ${err.message}`)
  console.warn('[generate-genres] WP取得失敗。既存ジャンルを維持します')
  await ensureFallbackFile()
  process.exit(0)
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, JSON.stringify(genres, null, 2), 'utf8')
console.log(`Generated ${path.relative(rootDir, outputPath)} (${genres.length} genres)`)
