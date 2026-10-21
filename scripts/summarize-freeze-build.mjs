/**
 * SSG 凍結ビルドの結果（実際に生成されたページ数）を、ルート種別ごとに集計して出力する。
 * `.open-next/cache` の各エントリが持つ `meta.routeCache.owner.sourceRoute` を使う。
 * `getStaticPaths` で列挙したが `notFound` で生成されなかったパスは、ここに現れない。
 * 列挙数（ビルドログの `[ssg-freeze] paths ...`）と比較して取りこぼしを確認する。
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const cacheDir = path.resolve(process.cwd(), '.open-next/cache')

/** ディレクトリ配下の `.cache` ファイルを再帰的に集める（`__fetch` は除外）。 */
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
const counts = new Map()
for (const file of files) {
  const entry = JSON.parse(await readFile(file, 'utf8'))
  const route = entry?.meta?.routeCache?.owner?.sourceRoute ?? '(unknown)'
  const locale = path.relative(cacheDir, file).split(path.sep)[1].replace(/\.cache$/, '')
  const key = `${route} [${locale}]`
  counts.set(key, (counts.get(key) ?? 0) + 1)
}

console.log('[ssg-freeze] 生成ページ数（ルート別 / ロケール別）')
for (const [key, n] of [...counts.entries()].sort()) console.log(`  ${key}: ${n}`)
console.log(`[ssg-freeze] 合計: ${files.length} ページ`)
