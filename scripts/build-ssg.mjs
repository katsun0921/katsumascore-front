/** Nextビルド子プロセス限定でWPキャッシュを有効化し、実生成数・所要時間を記録する。 */
import { spawnSync } from 'node:child_process';
import { reportDetailSsg } from './report-detail-ssg.mjs';
const started = Date.now();
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--webpack'], {
  stdio: 'inherit', env: { ...process.env, WP_SSG_BUILD: '1' },
});
if (result.status !== 0) process.exit(result.status ?? 1);
reportDetailSsg(Math.round((Date.now() - started) / 1000));
