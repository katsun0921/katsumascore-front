import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TActor, TCreditEntry } from "@/components/features/Post/PostTitleMeta";
import {
  stripHtml,
  extractActorLinksFromParsedWp,
  extractPersonLinksFromParsedWp,
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

/** 監督名を ACF フィールドのみから集め、重複除去してクレジット行を返す。 */
export const mapCreditsFromParsedWp = (wp: ParsedWPPost, locale: string): TCreditEntry[] | undefined => {
  const acf = wp.acf as Record<string, unknown> | undefined;
  const fromAcf = collectDirectorNamesFromAcf(acf?.director);
  if (fromAcf.length === 0) return undefined;
  const seen = new Set<string>();
  const names: TCreditEntry["names"] = [];
  for (const n of fromAcf) {
    const k = n.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    names.push({ name: n });
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

/** `_embedded['wp:term']` の actor/actors/person/persons ターム ID → {name, url} のマップを構築 */
const buildTermIdToActorInfoMap = (wp: ParsedWPPost): Map<number, { name: string; url: string }> => {
  const map = new Map<number, { name: string; url: string }>();
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return map;
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as Record<string, unknown>;
      const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy.trim() : "";
      const tax = taxRaw.replace(/^wp_/i, "").toLowerCase();
      const id = typeof t.id === "number" ? t.id : undefined;
      const name = typeof t.name === "string" ? t.name.trim() : "";
      const slug = typeof t.slug === "string" ? t.slug.trim() : "";
      if (id === undefined || !name || !slug) continue;
      if (tax === "actor" || tax === "actors") {
        map.set(id, { name, url: `/actor/${slug}` });
      } else if (tax === "person" || tax === "persons") {
        map.set(id, { name, url: `/person/${slug}` });
      }
    }
  }
  return map;
};

/**
 * `_embedded['wp:term']` から actor / person タクソノミーの `{ termId, taxType }` を
 * キャスト名をキーにして返す。フィルモグラフィー取得時のターム ID 解決に使用する。
 */
export const buildActorTermIdMap = (
  wp: ParsedWPPost,
): Map<string, { termId: number; taxType: "actor" | "person" }> => {
  const map = new Map<string, { termId: number; taxType: "actor" | "person" }>();
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return map;
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as Record<string, unknown>;
      const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy.trim() : "";
      const tax = taxRaw.replace(/^wp_/i, "").toLowerCase();
      const id = typeof t.id === "number" ? t.id : undefined;
      const name = typeof t.name === "string" ? t.name.trim() : "";
      if (id === undefined || !name) continue;
      if (tax === "actor" || tax === "actors") {
        map.set(name.toLowerCase(), { termId: id, taxType: "actor" });
      } else if (tax === "person" || tax === "persons") {
        map.set(name.toLowerCase(), { termId: id, taxType: "person" });
      }
    }
  }
  return map;
};

/** ACF 出演者行から `TActor[]` を構築する。actor/person タームへのリンクは埋め込みタームから解決する。 */
export const mapActors = (wp: ParsedWPPost): TActor[] | undefined => {
  const acf = wp.acf as Record<string, unknown> | undefined;
  const rows = pickActorsRowsFromAcf(acf);
  const termIdToInfo = buildTermIdToActorInfoMap(wp);
  const actorLinks = extractActorLinksFromParsedWp(wp);
  const personLinks = extractPersonLinksFromParsedWp(wp);
  // person タクソノミーが actor タクソノミーより優先（後から上書き）
  const nameToActorUrl = new Map<string, string>();
  for (const l of actorLinks) {
    nameToActorUrl.set(l.name.toLowerCase(), `/actor/${l.slug}`);
  }
  for (const l of personLinks) {
    nameToActorUrl.set(l.name.toLowerCase(), `/person/${l.slug}`);
  }
  const out: TActor[] = [];

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const ext = row as Record<string, unknown>;
    let nameStr: string | undefined;
    let actorUrl: string | undefined;
    if (typeof ext.name === "string" && ext.name.trim()) {
      nameStr = ext.name.trim();
    }
    if (!nameStr) {
      nameStr = pickActorDisplayNameFromUnknown(ext.actor);
    }
    // actor が数値 term ID の場合、_embedded の actor/person タームから名前・URL を解決する
    if (typeof ext.actor === "number" && Number.isFinite(ext.actor)) {
      const info = termIdToInfo.get(ext.actor as number);
      if (info) {
        if (!nameStr) nameStr = info.name;
        actorUrl = info.url;
      }
    }
    if (!nameStr && typeof ext.actor_name === "string" && ext.actor_name.trim()) {
      nameStr = ext.actor_name.trim();
    }
    if (!actorUrl && nameStr) {
      actorUrl = nameToActorUrl.get(nameStr.toLowerCase());
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
      ...(actorUrl ? { actorUrl } : {}),
      ...(descStr ? { description: descStr } : {}),
    });
  }

  return out.length > 0 ? out : undefined;
};
