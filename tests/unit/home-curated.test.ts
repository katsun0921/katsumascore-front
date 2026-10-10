import assert from 'node:assert/strict';
import test from 'node:test';

import { parseHomeCuratedResponse } from '../../src/libs/api/wordpress/endpoints/homeCurated';

const post = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  slug: 'dune',
  lang: 'ja',
  title: 'DUNE',
  excerpt: '',
  date: '2026-06-17T00:00:00',
  modified: '2026-06-17T00:00:00',
  featuredImage: { url: 'https://example.com/a.webp', width: 1200, height: 630, alt: '' },
  score: 4,
  categories: [{ id: 1, slug: 'movie', name: '映画' }],
  genres: [],
  tags: [],
  ...overrides,
});

test('franchise 枠を WP の順序のままパースする', () => {
  const [c] = parseHomeCuratedResponse({
    collections: [
      {
        label: 'DUNE',
        description: '公開順に',
        kind: 'franchise',
        seeAllHref: null,
        items: [{ id: 9, slug: 'dune', title: 'DUNE', description: '', image: null, postCount: 2, posts: [post(), post({ id: 2 })] }],
      },
    ],
  });
  assert.equal(c?.kind, 'franchise');
  assert.equal(c?.kind === 'franchise' && c.items[0]?.posts.map((p) => p.id).join(), '1,2');
});

test('description: false / image: null / score: false を未設定として扱う', () => {
  const [c] = parseHomeCuratedResponse({
    collections: [
      {
        label: 'ベスト',
        description: false,
        kind: 'posts',
        seeAllHref: false,
        items: [post({ score: false, featuredImage: null, excerpt: null })],
      },
    ],
  });
  assert.equal(c?.description, '');
  assert.equal(c?.seeAllHref, null);
  assert.equal(c?.kind === 'posts' && c.items[0]?.score, null);
  assert.equal(c?.kind === 'posts' && c.items[0]?.featuredImage, null);
});

test('未知の kind・items が空の枠・作品記事が 0 件のシリーズは捨てる', () => {
  const result = parseHomeCuratedResponse({
    collections: [
      { label: 'a', kind: 'future', items: [post()] },
      { label: 'b', kind: 'posts', items: [] },
      { label: 'c', kind: 'series', items: [{ id: 1, slug: 's', title: 's', posts: [] }] },
    ],
  });
  assert.deepEqual(result, []);
});

test('不正なレスポンスは空配列', () => {
  assert.deepEqual(parseHomeCuratedResponse(null), []);
  assert.deepEqual(parseHomeCuratedResponse({ collections: 'x' }), []);
  assert.deepEqual(parseHomeCuratedResponse({}), []);
});
