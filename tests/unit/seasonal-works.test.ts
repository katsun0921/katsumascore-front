import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectVodFilters,
  extractSeasonalWorks,
  normalizeSeasonalWorks,
} from '../../src/libs/seasonalWorks';

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

// --- ACF `works` リピーターの正規化 ---

test('ACF works を表示用の作品リストへ正規化する', () => {
  const works = normalizeSeasonalWorks([
    {
      title: '作品A',
      description: '作品Aのあらすじ。',
      official_url: 'https://example.com/a/',
      delivery_status: 'available',
      has_other_services: 0,
      vods: [{ service: 'danime', service_other: '', note: '' }],
    },
  ]);
  assert.equal(works.length, 1);
  assert.equal(works[0].title, '作品A');
  assert.equal(works[0].summary, '作品Aのあらすじ。');
  assert.equal(works[0].officialUrl, 'https://example.com/a/');
  assert.deepEqual(
    works[0].vods.map((v) => v.key),
    ['dアニメストア'],
  );
});

test('注記付きのサービスは key を保ったままラベルに注記を添える', () => {
  const works = normalizeSeasonalWorks([
    {
      title: '作品B',
      delivery_status: 'available',
      vods: [{ service: 'abema', note: 'exclusive' }],
    },
  ]);
  // 絞り込みキーは注記を含まない（ABEMA で絞れば独占配信も拾える）
  assert.equal(works[0].vods[0].key, 'ABEMA');
  assert.equal(works[0].vods[0].label, 'ABEMA（独占）');
  assert.equal(works[0].vods[0].isUndecided, false);
});

test('その他サービスは自由入力の名称を使う', () => {
  const works = normalizeSeasonalWorks([
    {
      title: '作品C',
      delivery_status: 'available',
      vods: [{ service: 'other', service_other: '謎の配信サービス' }],
    },
  ]);
  assert.equal(works[0].vods[0].key, '謎の配信サービス');
});

test('配信未発表・その他フラグを未確定バッジとして追加する', () => {
  const works = normalizeSeasonalWorks([
    { title: '作品D', delivery_status: 'undecided_planned', vods: false },
    { title: '作品E', delivery_status: 'available', has_other_services: 1, vods: [{ service: 'hulu' }] },
  ]);
  assert.deepEqual(works[0].vods, [
    {
      label: '配信サービス未発表（配信予定あり）',
      key: '配信サービス未発表（配信予定あり）',
      colorVar: null,
      isUndecided: true,
    },
  ]);
  const other = works[1].vods.find((v) => v.key === 'その他の配信サービス');
  assert.ok(other);
  assert.equal(other.isUndecided, true);

  // 未確定バッジは絞り込みの選択肢に出さない
  assert.deepEqual(collectVodFilters(works).map((f) => f.key), ['Hulu']);
});

test('display_order の昇順に並べ、未入力は後ろへ回す', () => {
  const works = normalizeSeasonalWorks([
    { title: '三番目', display_order: 3 },
    { title: '未入力' },
    { title: '一番目', display_order: '1' },
  ]);
  assert.deepEqual(
    works.map((w) => w.title),
    ['一番目', '三番目', '未入力'],
  );
});

test('タイトルが空の行は落とし、works が空なら空配列を返す', () => {
  assert.deepEqual(normalizeSeasonalWorks([{ title: '  ' }, { description: 'x' }]), []);
  assert.deepEqual(normalizeSeasonalWorks(false), []);
  assert.deepEqual(normalizeSeasonalWorks(undefined), []);
});
