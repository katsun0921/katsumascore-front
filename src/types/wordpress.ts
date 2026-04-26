import type { components } from "@/lib/api/wordpress/generated/wp-schema";

export type WPPost = components["schemas"]["WPPost"];
export type WPCategory = components["schemas"]["WPCategory"];
export type WPTag = components["schemas"]["WPTag"];
export type WPPage = components["schemas"]["WPPage"];

export type ScoreRank = "SS" | "S" | "A" | "B" | "C";

export const getScoreRank = (score: 1 | 2 | 3 | 4 | 5): ScoreRank => {
  if (score === 5) return "SS";
  if (score === 4) return "S";
  if (score === 3) return "A";
  if (score === 2) return "B";
  return "C";
};
