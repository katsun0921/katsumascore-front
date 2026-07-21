/**
 * WP 投稿から PostDetail 用データを組み立てるモジュール群の再エクスポート。
 */
export type { BuildPostDetailFromWpInput, PostsGroupSpec } from "./types";

export { buildPostDetailFromWp } from "./buildPostDetail";
export { extractRelationPostIds } from "./relationPostIds";
export { extractPostsGroupSpecsFromWp } from "./postsGroup";
export { extractVodIntroductionRelatedPostsTermId } from "./vodIntroduction";
export { buildActorPersonIdMap } from "./creditsActors";
