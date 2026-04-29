export type { WpFetchOptions, WpPostsListMeta, WpPostsPagedResult } from "./client";

export {
  getPosts,
  getPostsWithMeta,
  getPostBySlug,
  getRelatedPosts,
  searchPosts,
  getPostsByCategory,
  getPostsByTagId,
} from "./endpoints/posts";

export { getCategories, getCategoryBySlug } from "./endpoints/categories";

export { getTags, pickRandomTags } from "./endpoints/tags";

export { getChildPages, getPageBySlug, getFeaturedPages } from "./endpoints/pages";

export { stripHtml, mapWPPostToPost, parseWPPostUnknown } from "./transform";

export { WPPostSchema, WPCategorySchema, WPTagSchema, WPEmbeddedSchema, parseWPPost } from "./schema";
export type { ParsedWPPost } from "./schema";
