import type { ScoreRank } from "@/types/wordpress";

export const getScoreRank = (score: 1 | 2 | 3 | 4 | 5): ScoreRank => {
  if (score === 5) return "SS";
  if (score === 4) return "S";
  if (score === 3) return "A";
  if (score === 2) return "B";
  return "C";
};
