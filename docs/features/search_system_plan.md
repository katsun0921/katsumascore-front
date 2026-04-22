# Search System Implementation Plan (KatsumaScore)

## Overview
This document defines the full implementation of the search system including:

- Highlight (safe implementation)
- Ranking (scoring)
- Unified search UI (actor / director / genre)
- WordPress extension
- Next.js (lib / components / pages)

---

# 1. Highlight Implementation (Safe)

## Utility

```ts
export const highlightText = (text: string, keyword: string) => {
  if (!keyword) return text;

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
};
```

## Component

```tsx
import DOMPurify from 'dompurify';

export const HighlightText = ({
  text,
  keyword,
}: {
  text: string;
  keyword: string;
}) => {
  const html = highlightText(text, keyword);
  const clean = DOMPurify.sanitize(html);

  return <span dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

---

# 2. Ranking Design (Scoring)

## Scoring Rule

| Field | Score |
|------|------|
| title match | +10 |
| actor match | +5 |
| director match | +4 |
| genre match | +3 |

---

## Implementation (Next.js)

```ts
export const scorePost = (post: any, keyword: string) => {
  let score = 0;

  if (post.title.rendered.includes(keyword)) score += 10;
  if (post.acf?.actor?.includes(keyword)) score += 5;
  if (post.acf?.director?.includes(keyword)) score += 4;
  if (post.acf?.genre?.includes(keyword)) score += 3;

  return score;
};

export const sortPosts = (posts: any[], keyword: string) => {
  return posts
    .map((p) => ({ ...p, _score: scorePost(p, keyword) }))
    .sort((a, b) => b._score - a._score);
};
```

---

# 3. Unified Search UI

## Structure

```
SearchResult/
├── SearchResult.tsx
├── SearchResultItem.tsx
├── SearchFilters.tsx
```

---

## Filter UI

```tsx
export const SearchFilters = ({
  filters,
  onChange,
}) => {
  return (
    <div>
      <button onClick={() => onChange('all')}>All</button>
      <button onClick={() => onChange('actor')}>Actor</button>
      <button onClick={() => onChange('director')}>Director</button>
      <button onClick={() => onChange('genre')}>Genre</button>
    </div>
  );
};
```

---

# 4. Next.js Implementation

## lib/api/search.ts

```ts
export const searchPosts = async (query: string, page = 1) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WP_API}/wp/v2/posts?search=${query}&page=${page}&_embed`
  );

  const total = Number(res.headers.get('X-WP-Total') || 0);
  const posts = await res.json();

  return { posts, total };
};
```

---

## pages/search/index.tsx

```tsx
export default function SearchPage({ posts, query }) {
  return <SearchResult posts={posts} query={query} />;
}
```

---

# 5. WordPress Extension

## ACF Search Extension

```php
add_filter('posts_search', function($search, $wp_query) {
  global $wpdb;

  if (empty($search)) return $search;

  $search .= " OR EXISTS (
    SELECT 1 FROM $wpdb->postmeta
    WHERE $wpdb->postmeta.post_id = $wpdb->posts.ID
    AND $wpdb->postmeta.meta_key IN ('actor','director','genre')
  )";

  return $search;
}, 10, 2);
```

---

## REST Field (matched_fields)

```php
register_rest_field('post', 'matched_fields', [
  'get_callback' => function($post) {
    return ['title','actor','director'];
  }
]);
```

---

# 6. Final Architecture

```
Next.js
├── pages/search
├── lib/api
├── components/features/SearchResult

WordPress
├── search extension (posts_search)
├── ACF fields
├── REST extension
```

---

# 7. Summary

- Search logic → WordPress
- UI / UX → Next.js
- Ranking → Next.js (temporary)
- Future → Dedicated search API / Algolia
