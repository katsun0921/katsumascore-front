/**
 * WordPress REST クライアントとレスポンス正規化（transform / schema）の公開エントリ。
 */
export type { WpFetchOptions, WpPostsListMeta, WpPostsPagedResult } from "./client";

export {
  getPosts,
  getPostsWithMeta,
  getPostsPagedMerge,
  getPostBySlug,
  getRelatedPosts,
  searchPosts,
  getPostsByCategory,
  getPostsByTagId,
  getPostsByActorTermId,
  getPostsByPersonTermId,
} from "./endpoints/posts";

export {
  getCategories,
  getCategoriesForArchiveResolve,
  getCategoryBySlug,
} from "./endpoints/categories";

export { getTags, pickRandomTags } from "./endpoints/tags";

export {
  getGenres,
  getGenreBySlug,
  genreDisplayLabel,
  normalizeGenreTermAcf,
} from "./endpoints/genre";
export type { WPGenreTerm } from "./endpoints/genre";

export { getVodTermBySlug, getVodTerms } from "./endpoints/vodTaxonomy";
export type { WPVodTerm } from "./endpoints/vodTaxonomy";

export { getChildPages, getPageBySlug, getFeaturedPages } from "./endpoints/pages";

export { getPerson, getPersonBySlug, getPersonsByRole } from "./endpoints/persons";

export { getCompany, getCompanyBySlug } from "./endpoints/companies";

export {
  stripHtml,
  normalizePageContent,
  mapWPPostToPost,
  parseWPPostUnknown,
  titleSearchBlobFromParsedWp,
  extractGenreLinksFromParsedWp,
  extractPostTagLinksFromParsedWp,
  extractFilmStudioLinksFromParsedWp,
  extractProductionStudioLinksFromParsedWp,
  extractDirectorTermNamesFromParsedWp,
  extractActorTermNamesFromParsedWp,
  extractDirectorLinksFromParsedWp,
  extractActorLinksFromParsedWp,
  extractPersonLinksFromParsedWp,
} from "./transform";
export type { NormalizedPageContent, PostTaxonomyLink, Person, Company } from "./transform";
export { transformPerson, transformCompany } from "./transform";

export type { ParsedWPPost } from "./schema";
