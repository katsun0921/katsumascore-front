/**
 * WordPress 検索結果をキーワードのヒット次元（タイトル・出演者等）でスコア付けし、並べ替え・フィルタする。
 */
import type { ParsedWPPost } from "@/libs/api/wordpress/schema";
import { parseWPPostUnknown, stripHtml, titleSearchBlobFromParsedWp } from "@/libs/api/wordpress";

export type SearchDimensionFilter = "all" | "actor" | "director" | "genre";

export type SearchMatchKind = "title" | "actor" | "director" | "genre" | "fallback";

const WEIGHT: Record<Exclude<SearchMatchKind, "fallback">, number> = {
  title: 10,
  actor: 5,
  director: 4,
  genre: 3,
};

/** `needle` をトリムし、大文字小文字を無視して `haystack` に部分一致するか。空キーワードは不一致。 */
const includesKeyword = (haystack: string, needle: string): boolean => {
  const n = needle.trim();
  if (!n) return false;
  return haystack.toLowerCase().includes(n.toLowerCase());
};

/** 重複しないよう `kinds` にマッチ種別を追加する。 */
const pushKind = (kinds: SearchMatchKind[], kind: SearchMatchKind) => {
  if (!kinds.includes(kind)) kinds.push(kind);
};

/** 検索対象のタイトル文字列（HTML 除去済み）。 */
const titleBlob = (wp: ParsedWPPost): string => titleSearchBlobFromParsedWp(wp);

/** ACF 出演者リピーターから、名前・役名・説明などを連結した検索用テキストを作る。 */
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

/** `wp_*` プレフィックスを除き小文字化したタクソノミー名。 */
const normalizeTaxonomy = (raw: string): string => raw.replace(/^wp_/i, "").toLowerCase();

/** `_embedded['wp:term']` の各タームに対してコールバックを呼ぶ。 */
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

/** キーワードが当たった次元を列挙する。いずれにも当たらない場合は最後に `fallback` を付ける。 */
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

/** マッチ種別に応じた重みの合計。`fallback` は加点しない。 */
export const scoreFromKinds = (kinds: SearchMatchKind[]): number => {
  let score = 0;
  for (const kind of kinds) {
    if (kind === "fallback") continue;
    const w = WEIGHT[kind];
    if (w !== undefined) score += w;
  }
  return score;
};

/** UI の検索次元フィルタに、現在のマッチ種別が一致するか。`all` は常に真。 */
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

/** WP 検索の生配列をパースし、キーワード・次元に合う行だけ残して関連度スコア順に並べ替える。 */
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
