import assert from 'node:assert/strict';
import test from 'node:test';

import { collectVodFilters, extractSeasonalWorks } from '../../src/libs/seasonalWorks';

/** 実際の入稿と同じ構造（h2 → p → details）のサンプル。 */
const SAMPLE = `
<h2 id="heading-0"><a href="https://example.com/a/" target="_blank" rel="noopener noreferrer">作品A</a></h2>
<p>作品Aのあらすじ。</p>
<details>
  <summary>配信サービス</summary>
  <ul>
    <li>dアニメストア</li>
    <li>ABEMA（独占）</li>
    <li>その他の配信サービス</li>
  </ul>
</details>

<h2 id="heading-1"><a href="https://example.com/b/">作品B</a></h2>
<p>作品Bのあらすじ。</p>
<details>
  <summary>配信サービス</summary>
  <ul>
    <li>Amazon Prime Video</li>
    <li>配信サービス未発表</li>
  </ul>
</details>
`;

test('h2 / p / details の繰り返しから作品を抽出する', () => {
  const works = extractSeasonalWorks(SAMPLE);
  assert.equal(works.length, 2);
  assert.equal(works[0].title, '作品A');
  assert.equal(works[0].summary, '作品Aのあらすじ。');
  assert.equal(works[0].officialUrl, 'https://example.com/a/');
  assert.equal(works[0].id, 'heading-0');
  assert.equal(works[0].vods.length, 3);
});

test('注記付きの表記ゆれを同一サービスへ正規化する', () => {
  const works = extractSeasonalWorks(SAMPLE);
  const abema = works[0].vods.find((v) => v.label === 'ABEMA（独占）');
  assert.ok(abema);
  assert.equal(abema.key, 'ABEMA');
  assert.equal(abema.isUndecided, false);

  const prime = works[1].vods.find((v) => v.label === 'Amazon Prime Video');
  assert.ok(prime);
  assert.equal(prime.key, 'Prime Video');
});

test('配信未発表・その他は絞り込み対象から外す', () => {
  const works = extractSeasonalWorks(SAMPLE);
  assert.equal(works[0].vods.find((v) => v.label === 'その他の配信サービス')?.isUndecided, true);
  assert.equal(works[1].vods.find((v) => v.label === '配信サービス未発表')?.isUndecided, true);

  const filters = collectVodFilters(works);
  assert.deepEqual(
    filters.map((f) => f.key).sort(),
    ['ABEMA', 'Prime Video', 'dアニメストア'].sort(),
  );
});

test('見出しに id が無くても一意な id を採番する', () => {
  const works = extractSeasonalWorks('<h2>作品X</h2><p>説明</p><h2>作品Y</h2><p>説明</p>');
  assert.equal(works.length, 2);
  assert.notEqual(works[0].id, works[1].id);
  assert.equal(works[0].officialUrl, null);
});

test('h2 を持たない本文では空配列を返す（本文HTMLへフォールバックできる）', () => {
  assert.deepEqual(extractSeasonalWorks('<p>ただの本文です。</p>'), []);
  assert.deepEqual(extractSeasonalWorks(''), []);
});

test('あらすじは h2 直後の最初の p のみを採用する', () => {
  const works = extractSeasonalWorks('<h2>作品Z</h2><p>一文目。</p><p>二文目。</p>');
  assert.equal(works[0].summary, '一文目。');
});
