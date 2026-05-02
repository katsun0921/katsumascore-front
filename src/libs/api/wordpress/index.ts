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

export {
  getGenres,
  getGenreBySlug,
  genreDisplayLabel,
  normalizeGenreTermAcf,
} from "./endpoints/genre";
export type { WPGenreTerm } from "./endpoints/genre";

export { getChildPages, getPageBySlug, getFeaturedPages } from "./endpoints/pages";

export {
  stripHtml,
  mapWPPostToPost,
  parseWPPostUnknown,
  extractGenreLinksFromParsedWp,
  extractPostTagLinksFromParsedWp,
  extractFilmStudioLinksFromParsedWp,
  extractProductionStudioLinksFromParsedWp,
  extractDirectorTermNamesFromParsedWp,
  extractActorTermNamesFromParsedWp,
} from "./transform";
export type { PostTaxonomyLink } from "./transform";

export { WPPostSchema, WPCategorySchema, WPTagSchema, WPEmbeddedSchema, parseWPPost } from "./schema";
export type { ParsedWPPost } from "./schema";
