import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ESLint } from 'eslint';

const filePath = 'src/components/features/LintProbe/LintProbe.tsx';

test('importプラグインとNextプリセットが依存・設定に残らない', async () => {
  const lock = JSON.parse(await readFile(new URL('../../package-lock.json', import.meta.url), 'utf8'));
  const removedPackages = /\/(eslint-plugin-import|eslint-config-next|eslint-import-resolver-node|eslint-import-resolver-typescript)$/;
  assert.deepEqual(Object.keys(lock.packages).filter((path) => removedPackages.test(path)), []);
  const config = await new ESLint().calculateConfigForFile(filePath);
  assert.equal(config.plugins.import, undefined);
  assert.deepEqual(Object.keys(config.rules).filter((name) => name.startsWith('import/')), []);
});

test('Next・アクセシビリティ・TypeScript・Hooks・未使用importの検査を維持する', async (t) => {
  const eslint = new ESLint();
  const cases = [
    ['@next/next/no-img-element', 'const Probe = () => <img src="/test.png" alt="test"/>; export default Probe;'],
    ['jsx-a11y/alt-text', 'const Probe = () => <img src="/test.png"/>; export default Probe;'],
    ['jsx-a11y/aria-props', 'const Probe = () => <div aria-not-real="true"/>; export default Probe;'],
    ['@typescript-eslint/no-explicit-any', 'export const value: any = 1;'],
    ['react-hooks/rules-of-hooks', 'import { useState } from "react"; const Probe = () => { if (Math.random()) useState(0); return null; }; export default Probe;'],
    ['unused-imports/no-unused-imports', 'import { useState } from "react"; export const value = 1;'],
  ];
  for (const [ruleId, code] of cases) {
    await t.test(ruleId, async () => {
      const results = await eslint.lintText(code, { filePath });
      assert.ok(results.some((result) => result.messages.some((message) => message.ruleId === ruleId)));
    });
  }
});

test('Reactルールは互換ユーティリティ経由でESLint 10上でも実行できる', async () => {
  const eslint = new ESLint({ overrideConfig: [{ rules: { 'react/jsx-key': 'error' } }] });
  const results = await eslint.lintText('const Probe = () => [<span/>]; export default Probe;', { filePath });
  assert.ok(results.some((result) => result.messages.some((message) => message.ruleId === 'react/jsx-key')));
});
