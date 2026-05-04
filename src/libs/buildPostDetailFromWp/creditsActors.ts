import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TActor, TCreditEntry } from "@/components/features/Post/PostTitleMeta";
import {
  stripHtml,
  extractActorTermNamesFromParsedWp,
  extractDirectorTermNamesFromParsedWp,
} from "@/libs/api/wordpress";

/**
 * ACF `director` の表記ゆれ（文字列 / 配列 / リレーション風オブジェクト）を名前配列へ正規化する。
 */
const collectDirectorNamesFromAcf = (raw: unknown): string[] => {
  if (raw == null) return [];
  if (typeof raw === "string") {
    return raw
      .split(/[,、\n|]/)
      .map((s) => stripHtml(s).trim())
      .filter(Boolean);
  }
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const item of raw) {
      if (typeof item === "string") {
        const t = stripHtml(item).trim();
        if (t) out.push(t);
        continue;
      }
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const name = typeof o.name === "string" ? stripHtml(o.name).trim() : "";
        let titleRendered = "";
        if (typeof o.title === "object" && o.title !== null && "rendered" in o.title) {
          titleRendered = stripHtml(String((o.title as { rendered?: unknown }).rendered ?? "")).trim();
        }
        if (!titleRendered && typeof o.title === "string") {
          titleRendered = stripHtml(o.title).trim();
        }
        const postTitle = typeof o.post_title === "string" ? stripHtml(o.post_title).trim() : "";
        const chosen = name || titleRendered || postTitle;
        if (chosen) out.push(chosen);
      }
    }
    return out;
  }
  return [];
};

/** 監督名をターム・ACF の両方から集め、重複除去してクレジット行を返す。 */
export const mapCreditsFromParsedWp = (wp: ParsedWPPost, locale: string): TCreditEntry[] | undefined => {
  const fromTerms = extractDirectorTermNamesFromParsedWp(wp);
  const acf = wp.acf as Record<string, unknown> | undefined;
  const fromAcf = collectDirectorNamesFromAcf(acf?.director);
  const seen = new Set<string>();
  const names: string[] = [];
  for (const n of [...fromTerms, ...fromAcf]) {
    const k = n.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    names.push(n);
  }
  if (names.length === 0) return undefined;
  const role = locale === "en" ? "Director" : "監督";
  return [{ role, names }];
};

/**
 * ACF リピータ1行の `actor`（リレーション）から表示名を取る。
 * 純粋な数値 ID のみは解決不能のため `undefined`。
 */
const pickActorDisplayNameFromUnknown = (raw: unknown): string | undefined => {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    const t = stripHtml(raw).trim();
    if (!t) return undefined;
    if (/^\d+$/.test(t)) return undefined;
    return t;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) return undefined;
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const name = typeof o.name === "string" ? stripHtml(o.name).trim() : "";
    let titleRendered = "";
    if (typeof o.title === "object" && o.title !== null && "rendered" in o.title) {
      titleRendered = stripHtml(String((o.title as { rendered?: unknown }).rendered ?? "")).trim();
    }
    if (!titleRendered && typeof o.title === "string") {
      titleRendered = stripHtml(o.title).trim();
    }
    const postTitle = typeof o.post_title === "string" ? stripHtml(o.post_title).trim() : "";
    const chosen = name || titleRendered || postTitle;
    return chosen || undefined;
  }
  return undefined;
};

/** 出演者リピーター配列を、複数の候補フィールド名のうち最初に見つかったものから返す。 */
const pickActorsRowsFromAcf = (acf: Record<string, unknown> | undefined): unknown[] => {
  if (!acf) return [];
  const candidates = [acf.actors_filed, acf.actors_field, acf.cast];
  for (const v of candidates) {
    if (Array.isArray(v) && v.length > 0) return v;
  }
  return [];
};

/** `_embedded['wp:term']` の actor タクソノミーから term ID → name のマップを構築 */
const buildActorTermIdMap = (wp: ParsedWPPost): Map<number, string> => {
  const map = new Map<number, string>();
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return map;
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as Record<string, unknown>;
      const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy.trim() : "";
      const tax = taxRaw.replace(/^wp_/i, "").toLowerCase();
      if (tax !== "actor" && tax !== "actors") continue;
      const id = typeof t.id === "number" ? t.id : undefined;
      const name = typeof t.name === "string" ? t.name.trim() : "";
      if (id !== undefined && name) map.set(id, name);
    }
  }
  return map;
};

/** ACF 出演者行と actor タームをマージして `TActor[]` を構築する。 */
export const mapActors = (wp: ParsedWPPost): TActor[] | undefined => {
  const acf = wp.acf as Record<string, unknown> | undefined;
  const rows = pickActorsRowsFromAcf(acf);
  const actorTermIdMap = buildActorTermIdMap(wp);
  const out: TActor[] = [];
  const seenNames = new Set<string>();

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const ext = row as Record<string, unknown>;
    let nameStr: string | undefined;
    if (typeof ext.name === "string" && ext.name.trim()) {
      nameStr = ext.name.trim();
    }
    if (!nameStr) {
      nameStr = pickActorDisplayNameFromUnknown(ext.actor);
    }
    // actor が数値 term ID の場合、_embedded の actor タームから名前を解決する
    if (!nameStr && typeof ext.actor === "number" && Number.isFinite(ext.actor)) {
      nameStr = actorTermIdMap.get(ext.actor as number);
    }
    if (!nameStr && typeof ext.actor_name === "string" && ext.actor_name.trim()) {
      nameStr = ext.actor_name.trim();
    }
    const charStr =
      typeof ext.character === "string" && ext.character.trim() ? ext.character.trim() : undefined;
    const roleStr = typeof ext.role === "string" && ext.role.trim() ? ext.role.trim() : undefined;
    const descStr =
      typeof ext.description === "string" && ext.description.trim() ? ext.description.trim() : undefined;
    const displayCharacter = roleStr ?? charStr;
    if (!displayCharacter && !nameStr && !descStr) continue;
    out.push({
      ...(displayCharacter ? { character: displayCharacter } : {}),
      ...(nameStr ? { actorName: nameStr } : {}),
      ...(descStr ? { description: descStr } : {}),
    });
    if (nameStr) seenNames.add(nameStr.toLowerCase());
  }

  for (const termName of extractActorTermNamesFromParsedWp(wp)) {
    const k = termName.toLowerCase();
    if (seenNames.has(k)) continue;
    seenNames.add(k);
    out.push({ actorName: termName });
  }

  return out.length > 0 ? out : undefined;
};
