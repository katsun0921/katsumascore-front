import assert from 'node:assert/strict';
import test from 'node:test';

import { mapWPPostToPost, parseWPPostUnknown } from '../../src/libs/api/wordpress/transform';
import { MOCK_WP_POSTS } from '../../src/mocks/wp/mockWpDataset';

const samplePost = MOCK_WP_POSTS[0];

test('年齢区分が未設定でも投稿を一覧から除外しない', () => {
  for (const rating of [undefined, null, false, '']) {
    const raw = { ...samplePost, acf: { ...samplePost.acf, rating } };
    const post = mapWPPostToPost(raw);
    assert.ok(post, `rating=${String(rating)} の投稿が除外された`);
    assert.equal(post.id, String(samplePost.id));
  }
});

test('年齢区分が設定済みの投稿も正規化できる', () => {
  const raw = { ...samplePost, acf: { ...samplePost.acf, rating: 'pg12' } };
  const parsed = parseWPPostUnknown(raw);
  assert.equal(parsed?.acf?.rating, 'pg12');
  const post = mapWPPostToPost(raw);
  assert.ok(post);
  assert.equal(post.id, String(samplePost.id));
});
