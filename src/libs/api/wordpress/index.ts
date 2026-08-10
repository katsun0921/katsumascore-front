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
  getPostsByFranchiseTermId,
} from "./endpoints/posts";

export { getSitemapPosts } from "./endpoints/sitemapPosts";
export type { WPSitemapPost } from "./endpoints/sitemapPosts";

export {
  getCategories,
  getCategoriesForArchiveResolve,
  getCategoryBySlug,
} from "./endpoints/categories";

export { getTags, pickRandomTags, getTagBySlug } from "./endpoints/tags";

export {
  getGenres,
  getGenreBySlug,
  genreDisplayLabel,
  normalizeGenreTermAcf,
} from "./endpoints/genre";
export type { WPGenreTerm } from "./endpoints/genre";

export { getVodTermBySlug, getVodTerms } from "./endpoints/vodTaxonomy";
export type { WPVodTerm } from "./endpoints/vodTaxonomy";

export { getVodReleaseBySlug, getVodReleases } from "./endpoints/vodRelease";
export type { WPVodRelease } from "./endpoints/vodRelease";

export { getTheaterReleaseBySlug, getTheaterReleases } from "./endpoints/theaterRelease";
export type { WPTheaterRelease } from "./endpoints/theaterRelease";

export { getVodList } from "./endpoints/vodList";
export type {
  VodListTerm,
  VodListFeaturedImage,
  VodListItem,
  VodListMeta,
  VodListResponse,
  VodListFilter,
  VodListParams,
} from "./endpoints/vodList";

export { getPostsByPersonId } from "./endpoints/personRelatedPosts";
export type { PersonRelatedPostsParams, PersonRelatedPost } from "./endpoints/personRelatedPosts";

export { getPostsByCompanyId } from "./endpoints/companyRelatedPosts";
export type { CompanyRelatedPostsParams, CompanyRelatedPost } from "./endpoints/companyRelatedPosts";

export { getChildPages, getPageBySlug, getFeaturedPages } from "./endpoints/pages";

export { getPerson, getPersonBySlug, getPersons, getPersonsByRole } from "./endpoints/persons";

export { getCompany, getCompanyBySlug } from "./endpoints/companies";

export {
  getFranchises,
  getAllFranchiseSlugs,
  getFranchiseBySlug,
  transformFranchise,
} from "./endpoints/franchise";
export type { WPFranchiseTerm, WPFranchiseAcf } from "./endpoints/franchise";

export {
  stripHtml,
  normalizePageContent,
  mapWPPostToPost,
  parseWPPostUnknown,
  titleSearchBlobFromParsedWp,
  extractGenreLinksFromParsedWp,
  extractPostTagLinksFromParsedWp,
  extractDirectorTermNamesFromParsedWp,
  extractActorTermNamesFromParsedWp,
  extractDirectorLinksFromParsedWp,
  extractActorLinksFromParsedWp,
  extractPersonLinksFromParsedWp,
  extractFranchiseTermsFromParsedWp,
} from "./transform";
export type { NormalizedPageContent, PostTaxonomyLink, FranchiseTerm, Person, Company } from "./transform";
export { transformPerson, transformCompany } from "./transform";

export type { ParsedWPPost } from "./schema";
