import type { ParsedWPPost } from "@/libs/api/wordpress/schema";
import { parseWPPostUnknown, stripHtml } from "@/libs/api/wordpress";

export type SearchDimensionFilter = "all" | "actor" | "director" | "genre";

export type SearchMatchKind = "title" | "actor" | "director" | "genre" | "fallback";

const WEIGHT: Record<Exclude<SearchMatchKind, "fallback">, number> = {
  title: 10,
  actor: 5,
  director: 4,
  genre: 3,
};

const includesKeyword = (haystack: string, needle: string): boolean => {
  const n = needle.trim();
  if (!n) return false;
  return haystack.toLowerCase().includes(n.toLowerCase());
};

const pushKind = (kinds: SearchMatchKind[], kind: SearchMatchKind) => {
  if (!kinds.includes(kind)) kinds.push(kind);
};

const titleBlob = (wp: ParsedWPPost): string => {
  const parts = [stripHtml(wp.title.rendered)];
  const acfTitleLine = wp.acf?.title_jp?.trim();
  const acfAlternateTitleLine = wp.acf?.title_en?.trim();
  if (acfTitleLine) parts.push(stripHtml(acfTitleLine));
  if (acfAlternateTitleLine) parts.push(stripHtml(acfAlternateTitleLine));
  return parts.join(" ");
};

const actorsBlob = (wp: ParsedWPPost): string => {
  const rows = wp.acf?.actors_filed;
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const chunks: string[] = [];
  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name : "";
    const character = typeof r.character === "string" ? r.character : "";
    const description = typeof r.description === "string" ? r.description : "";
    const role = typeof r.role === "string" ? r.role : "";
    const line = [name, character, description, role].filter(Boolean).join(" ");
    if (line) chunks.push(line);
  }
  return chunks.join(" ");
};

type TermLike = { name?: string; taxonomy?: string };

const normalizeTaxonomy = (raw: string): string => raw.replace(/^wp_/i, "").toLowerCase();

const eachEmbeddedTerm = (wp: ParsedWPPost, fn: (name: string, taxonomy: string) => void) => {
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return;
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as TermLike;
      const name = typeof t.name === "string" ? t.name : "";
      const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy : "";
      if (!name) continue;
      fn(name, normalizeTaxonomy(taxRaw));
    }
  }
};

export const getSearchMatchKinds = (wp: ParsedWPPost, keyword: string): SearchMatchKind[] => {
  const k = keyword.trim();
  const kinds: SearchMatchKind[] = [];
  if (!k) return kinds;

  if (includesKeyword(titleBlob(wp), k)) pushKind(kinds, "title");

  if (includesKeyword(actorsBlob(wp), k)) pushKind(kinds, "actor");

  eachEmbeddedTerm(wp, (name, taxonomy) => {
    if (!includesKeyword(name, k)) return;
    if (taxonomy === "actor" || taxonomy === "actors") pushKind(kinds, "actor");
    if (taxonomy === "director" || taxonomy === "directors") pushKind(kinds, "director");
    if (taxonomy === "genre" || taxonomy === "genres") pushKind(kinds, "genre");
  });

  if (kinds.length === 0) pushKind(kinds, "fallback");

  return kinds;
};

export const scoreFromKinds = (kinds: SearchMatchKind[]): number => {
  let score = 0;
  for (const kind of kinds) {
    if (kind === "fallback") continue;
    const w = WEIGHT[kind];
    if (w !== undefined) score += w;
  }
  return score;
};

export const matchesSearchDimension = (
  kinds: SearchMatchKind[],
  filter: SearchDimensionFilter,
): boolean => {
  if (filter === "all") return true;
  return kinds.includes(filter);
};

export type PreparedSearchRow = {
  wp: unknown;
  parsed: ParsedWPPost;
  kinds: SearchMatchKind[];
  score: number;
};

/** WP 検索結果を関連度で並べ替え、次元フィルタを適用する */
export const prepareSearchResults = (
  raw: unknown[],
  keyword: string,
  dimension: SearchDimensionFilter,
): PreparedSearchRow[] => {
  const k = keyword.trim();
  const rows: PreparedSearchRow[] = [];

  for (const wp of raw) {
    const parsed = parseWPPostUnknown(wp);
    if (!parsed) continue;
    const kinds = getSearchMatchKinds(parsed, k);
    if (!matchesSearchDimension(kinds, dimension)) continue;
    const score = scoreFromKinds(kinds);
    rows.push({ wp, parsed, kinds, score });
  }

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return stripHtml(a.parsed.title.rendered).localeCompare(stripHtml(b.parsed.title.rendered), "ja");
  });

  return rows;
};
