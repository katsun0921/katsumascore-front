import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';

type Wrangler = {
  name: string;
  main: string;
  r2_buckets?: { binding: string; bucket_name: string }[];
  services?: { binding: string; service: string }[];
  durable_objects?: { bindings?: { name: string; class_name: string }[] };
  migrations?: { tag: string; new_sqlite_classes?: string[] }[];
};

/** `//` 行コメントを除いて wrangler.jsonc を読む。 */
const readWrangler = async (): Promise<Wrangler> => {
  const raw = await readFile('wrangler.jsonc', 'utf8');
  return JSON.parse(raw.split('\n').filter((line) => !line.trim().startsWith('//')).join('\n')) as Wrangler;
};

test('Cloudflare構成: ページキャッシュのバインディングが揃っている', async (t) => {
  const wrangler = await readWrangler();

  await t.test('R2のincremental cacheバインディングはOpenNextの既定名で宣言されている', () => {
    const bucket = wrangler.r2_buckets?.find((entry) => entry.binding === 'NEXT_INC_CACHE_R2_BUCKET');
    assert.ok(bucket, 'NEXT_INC_CACHE_R2_BUCKET が無い');
    assert.ok(bucket.bucket_name, 'バケット名が空');
  });

  await t.test('自己参照のservice bindingは自分自身のWorker名を指す', () => {
    const self = wrangler.services?.find((entry) => entry.binding === 'WORKER_SELF_REFERENCE');
    assert.equal(self?.service, wrangler.name);
  });

  await t.test('キュー用Durable Objectのバインディングとマイグレーションが対応している', () => {
    const binding = wrangler.durable_objects?.bindings?.find((entry) => entry.name === 'NEXT_CACHE_DO_QUEUE');
    assert.ok(binding, 'NEXT_CACHE_DO_QUEUE が無い');
    const migrated = wrangler.migrations?.flatMap((entry) => entry.new_sqlite_classes ?? []) ?? [];
    assert.ok(migrated.includes(binding.class_name), `${binding.class_name} のマイグレーションが無い`);
  });

  await t.test('OpenNextのキャッシュ/キューはdummyではなく、R2とDOに切り替わっている', async () => {
    const { default: config } = await import('../../open-next.config');
    const override = config.default?.override;
    assert.equal(typeof override?.incrementalCache, 'function', 'incrementalCache が dummy のまま');
    assert.equal(typeof override?.queue, 'function', 'queue が dummy のまま');
    const source = await readFile('open-next.config.ts', 'utf8');
    assert.match(source, /r2-incremental-cache/);
    assert.match(source, /do-queue/);
  });
});

test('デプロイワークフロー: 日次ビルドとDependabot除外が設定されている', async (t) => {
  const workflow = await readFile('.github/workflows/deploy-cloudflare-workers.yml', 'utf8');

  await t.test('トリガーはmainへのpush・日次cron・手動実行', () => {
    assert.match(workflow, /push:\s*\n\s*branches:\s*\n\s*- main/);
    assert.match(workflow, /schedule:\s*\n\s*- cron: "17 19 \* \* \*"/);
    assert.match(workflow, /workflow_dispatch:/);
  });

  await t.test('同時実行は1本化し、実行中のデプロイを途中で取り消さない', () => {
    assert.match(workflow, /concurrency:\s*\n\s*group: deploy-production\s*\n\s*cancel-in-progress: false/);
  });

  await t.test('Dependabot由来の実行・pushを除外し、PR判定に必要な権限だけ持つ', () => {
    assert.match(workflow, /github\.actor != 'dependabot\[bot\]'/);
    assert.match(workflow, /contains\(github\.event\.head_commit\.message, 'dependabot\/'\)/);
    assert.match(workflow, /pull-requests: read/);
    assert.doesNotMatch(workflow, /pull-requests: write/);
    assert.match(workflow, /\.user\.login == "dependabot\[bot\]"/);
  });

  await t.test('インストールとデプロイは should_deploy でガードされている', () => {
    for (const step of ['Setup Node.js', 'Install dependencies', 'Build and deploy']) {
      const block = workflow.split(/\n {6}- name: /).find((chunk) => chunk.startsWith(step));
      assert.ok(block, `${step} ステップが無い`);
      assert.match(block, /steps\.eligibility\.outputs\.should_deploy == 'true'/, step);
    }
  });

  await t.test('WP_BUILD_TOKENは任意: 未設定でもビルドを止めず、値をログに出さない', () => {
    assert.match(workflow, /WP_BUILD_TOKEN: \$\{\{ secrets\.WP_BUILD_TOKEN \}\}/);
    assert.match(workflow, /::warning::WP_BUILD_TOKEN未設定/);
    assert.doesNotMatch(workflow, /echo[^\n]*\$WP_BUILD_TOKEN/);
    assert.doesNotMatch(workflow, /-z "\$WP_BUILD_TOKEN"\s*\]; then\s*\n\s*(echo [^\n]*\n\s*)?exit 1/);
  });

  await t.test('生成数レポートを失敗時にも保存する', () => {
    assert.match(workflow, /if: always\(\) && steps\.eligibility\.outputs\.should_deploy == 'true'/);
    assert.match(workflow, /path: \.next\/ssg-detail-report\.json/);
  });
});
