import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { getWpResponseDiagnostics } from '../../scripts/wp-response-diagnostics.mjs';

test('WP応答診断は本文や秘密値を出力せず、遮断元の手掛かりだけを返す', async () => {
  const secret = 'test-only-sensitive-value';
  const response = new Response(`<html>Cloudflare Forbidden Access ${secret}</html>`, {
    status: 403,
    headers: {
      server: `cloudflare ${secret}`,
      'content-type': 'text/html',
      'cf-ray': secret,
      'cf-mitigated': 'challenge',
      'set-cookie': secret,
      'x-build-token': secret,
    },
  });
  const result = await getWpResponseDiagnostics(response);
  assert.equal(result.status, 403);
  assert.deepEqual(result.serverHints, ['cloudflare']);
  assert.equal(result.hasCfRay, true);
  assert.equal(result.cloudflareChallenge, true);
  assert.equal(result.bodyHints.cloudflare, true);
  assert.equal(result.bodyHints.forbiddenAccess, true);
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test('WP応答診断はWordPressエラーを検出し、本文読み取りを16KiBで打ち切る', async () => {
  const wp = await getWpResponseDiagnostics(new Response('{"code":"rest_forbidden","message":"private"}', {
    status: 403, headers: { 'content-type': 'application/json' },
  }));
  assert.equal(wp.bodyHints.wordpressRestError, true);
  assert.deepEqual(wp.contentTypeHints, ['application/json']);
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    start: (controller) => controller.enqueue(new TextEncoder().encode('x'.repeat(20_000) + 'Cloudflare')),
    cancel: () => { cancelled = true; },
  });
  const result = await getWpResponseDiagnostics(new Response(body, { status: 403 }));
  assert.equal(result.bodyHints.cloudflare, false);
  assert.equal(cancelled, true);
});

const repoRoot = process.cwd();
const genresPath = path.join(repoRoot, 'src/data/genres.json');

type ManifestRoute = { srcRoute: string; initialRevalidateSeconds: number | false };
type Manifest = {
  routes: Record<string, ManifestRoute>;
  notFoundRoutes: string[];
  dynamicRoutes: Record<string, { fallback: null | string | false }>;
};

const detailRoutes = [
  '/[slug]', '/movie/[slug]', '/anime/[slug]', '/drama/[slug]', '/person/[slug]',
  '/company/[slug]', '/franchise/[slug]', '/seasonal-reviews/[slug]',
  '/seasonal-anime-and-dramas-reviews/[slug]', '/theater-release/[slug]', '/vod-release/[slug]',
];

/** 全詳細ルートがblockingのマニフェストを作る。 */
const baseManifest = (): Manifest => ({
  routes: {
    '/ja/movie/a': { srcRoute: '/movie/[slug]', initialRevalidateSeconds: false },
    '/en/movie/b': { srcRoute: '/movie/[slug]', initialRevalidateSeconds: false },
    '/person/c': { srcRoute: '/person/[slug]', initialRevalidateSeconds: false },
    '/ja': { srcRoute: '/', initialRevalidateSeconds: 300 },
  },
  notFoundRoutes: [],
  dynamicRoutes: Object.fromEntries(detailRoutes.map((route) => [route, { fallback: null }])),
});

/** 一時ディレクトリへマニフェストを置き、そこをcwdにして集計スクリプトを実行する。 */
const runReport = async (manifest: Manifest, token: string | undefined) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ssg-report-'));
  const previousCwd = process.cwd();
  const previousToken = process.env.WP_BUILD_TOKEN;
  try {
    await mkdir(path.join(dir, '.next'));
    await writeFile(path.join(dir, '.next/prerender-manifest.json'), JSON.stringify(manifest));
    process.chdir(dir);
    if (token === undefined) delete process.env.WP_BUILD_TOKEN;
    else process.env.WP_BUILD_TOKEN = token;
    const { reportDetailSsg } = await import('../../scripts/report-detail-ssg.mjs');
    const report = reportDetailSsg(12);
    const saved: unknown = JSON.parse(await readFile(path.join(dir, '.next/ssg-detail-report.json'), 'utf8'));
    return { report, saved };
  } finally {
    process.chdir(previousCwd);
    if (previousToken === undefined) delete process.env.WP_BUILD_TOKEN;
    else process.env.WP_BUILD_TOKEN = previousToken;
    await rm(dir, { recursive: true, force: true });
  }
};

test('生成数レポート', async (t) => {
  const originalWarn = console.warn;
  const originalLog = console.log;
  console.warn = () => {};
  console.log = () => {};
  try {
    await t.test('詳細ルートだけをロケール別に集計し、レポートを書き出す', async () => {
      const { report, saved } = await runReport(baseManifest(), undefined);
      assert.equal(report.total, 3);
      assert.equal(report.counts['/movie/[slug]'], 2);
      assert.equal(report.counts['/person/[slug]'], 1);
      assert.deepEqual(report.countsByLocale['/movie/[slug]'], { ja: 1, en: 1, default: 0 });
      assert.deepEqual(report.countsByLocale['/person/[slug]'], { ja: 0, en: 0, default: 1 });
      assert.equal(report.durationSeconds, 12);
      assert.deepEqual(saved, JSON.parse(JSON.stringify(report)));
    });

    await t.test('詳細にISR(revalidateあり)が混ざると、トークンの有無によらず失敗する', async () => {
      const manifest = baseManifest();
      manifest.routes['/ja/movie/isr'] = { srcRoute: '/movie/[slug]', initialRevalidateSeconds: 60 };
      await assert.rejects(runReport(manifest, undefined), /still ISR/);
      await assert.rejects(runReport(manifest, 'test-only-token'), /still ISR/);
    });

    await t.test('fallbackがblockingでない詳細ルートがあると失敗する', async () => {
      const manifest = baseManifest();
      manifest.dynamicRoutes['/company/[slug]'] = { fallback: false };
      await assert.rejects(runReport(manifest, undefined), /not blocking: \/company\/\[slug\]/);
    });

    await t.test('動的ルートが欠落していても(undefined)blocking違反として失敗する', async () => {
      const manifest = baseManifest();
      delete manifest.dynamicRoutes['/vod-release/[slug]'];
      await assert.rejects(runReport(manifest, undefined), /not blocking: \/vod-release\/\[slug\]/);
    });

    await t.test('未生成(404)の詳細は、トークン未設定なら除外して続行し、設定済みなら失敗する', async () => {
      const manifest = baseManifest();
      manifest.notFoundRoutes = ['/ja/movie/a'];
      const { report } = await runReport(manifest, '   ');
      assert.equal(report.counts['/movie/[slug]'], 1);
      assert.equal(report.total, 2);
      await assert.rejects(runReport(manifest, 'test-only-token'), /Detail SSG failed: \/ja\/movie\/a/);
    });
  } finally {
    console.warn = originalWarn;
    console.log = originalLog;
  }
});

/** generate-genres.mjs を子プロセスで実行し、終了コードを返す。 */
const runGenres = (args: string[], env: Record<string, string>, onStderr?: (output: string) => void): Promise<number | null> =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'scripts/generate-genres.mjs', ...args], {
      cwd: repoRoot,
      env: { ...process.env, WP_BUILD_TOKEN: '', ...env },
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    child.stderr.on('data', (chunk: Buffer) => onStderr?.(chunk.toString('utf8')));
    child.on('error', reject);
    child.on('close', resolve);
  });

test('ジャンル事前生成スクリプト', async (t) => {
  // 実ファイルを壊さないよう退避し、最後に必ず戻す(genres.json は .gitignore 対象)。
  const backup = path.join(await mkdtemp(path.join(tmpdir(), 'genres-backup-')), 'genres.json');
  let hadFile = true;
  try {
    await copyFile(genresPath, backup);
  } catch {
    hadFile = false;
  }
  let status = 200;
  let body: unknown = [];
  const server: Server = createServer((_request, response) => {
    response.writeHead(status, { 'content-type': 'application/json' });
    response.end(JSON.stringify(body));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const apiUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/wp-json/wp/v2`;
  const removeGenres = () => rm(genresPath, { force: true });

  try {
    await t.test('取得成功時はWPの内容を書き出す', async () => {
      status = 200;
      body = [{ slug: 'action', name: 'アクション', count: 3 }];
      assert.equal(await runGenres([], { WP_API_URL: apiUrl }), 0);
      assert.deepEqual(JSON.parse(await readFile(genresPath, 'utf8')), body);
    });

    await t.test('取得失敗(403)・トークン未設定: 続行し、既存の実データを上書きしない', async () => {
      await writeFile(genresPath, JSON.stringify([{ slug: 'kept' }]));
      status = 403;
      assert.equal(await runGenres(['--required'], { WP_API_URL: apiUrl }), 0);
      assert.deepEqual(JSON.parse(await readFile(genresPath, 'utf8')), [{ slug: 'kept' }]);
    });

    await t.test('取得失敗(403)・ファイル無し: 空配列を書き出し、ファイル欠如を避ける', async () => {
      await removeGenres();
      status = 403;
      assert.equal(await runGenres([], { WP_API_URL: apiUrl }), 0);
      assert.deepEqual(JSON.parse(await readFile(genresPath, 'utf8')), []);
    });

    await t.test('WP_API_URL未設定・ファイル無し: 空配列を書き出す', async () => {
      await removeGenres();
      assert.equal(await runGenres([], { WP_API_URL: '' }), 0);
      assert.deepEqual(JSON.parse(await readFile(genresPath, 'utf8')), []);
    });

    await t.test('--required かつトークン設定済みなら、取得失敗で異常終了する', async () => {
      await writeFile(genresPath, JSON.stringify([{ slug: 'kept' }]));
      status = 403;
      assert.notEqual(await runGenres(['--required'], { WP_API_URL: apiUrl, WP_BUILD_TOKEN: 'test-only-token' }), 0);
      assert.deepEqual(JSON.parse(await readFile(genresPath, 'utf8')), [{ slug: 'kept' }]);
    });

    await t.test('403の診断ログを出し、反射されたトークンは出力せず異常終了する', async () => {
      status = 403;
      body = { code: 'rest_forbidden', message: 'test-only-reflected-secret' };
      let stderr = '';
      const code = await runGenres(['--required'], {
        WP_API_URL: apiUrl, WP_BUILD_TOKEN: 'test-only-reflected-secret',
      }, (output) => { stderr += output; });
      assert.notEqual(code, 0);
      assert.match(stderr, /WP response diagnostics:/);
      assert.match(stderr, /"wordpressRestError":true/);
      assert.match(stderr, /generate-genres failed: HTTP 403/);
      assert.equal(stderr.includes('test-only-reflected-secret'), false);
    });

    await t.test('--required かつトークン設定済みなら、レスポンスが配列でなくても異常終了する', async () => {
      status = 200;
      body = { not: 'an array' };
      assert.notEqual(await runGenres(['--required'], { WP_API_URL: apiUrl, WP_BUILD_TOKEN: 'test-only-token' }), 0);
    });

    await t.test('--required でもトークンが空白だけなら続行する', async () => {
      status = 403;
      assert.equal(await runGenres(['--required'], { WP_API_URL: apiUrl, WP_BUILD_TOKEN: '   ' }), 0);
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (hadFile) await copyFile(backup, genresPath);
    else await removeGenres();
    await rm(path.dirname(backup), { recursive: true, force: true });
  }
});
