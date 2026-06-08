import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TActor, TCreditEntry } from "@/components/features/Post/PostTitleMeta";
import {
  stripHtml,
  extractActorLinksFromParsedWp,
  extractPersonLinksFromParsedWp,
} from "@/libs/api/wordpress";

/** WPPerson オブジェクト（REST API 形式 / WP_Post 形式）から name と slug を抽出する。 */
const extractPersonInfoFromObject = (o: Record<string, unknown>): { name: string; slug: string } | undefined => {
  const acfFields =
    typeof o.acf === "object" && o.acf !== null ? (o.acf as Record<string, unknown>) : undefined;

  // name: acf.name_ja → acf.name_en → title.rendered → post_title
  let name =
    (acfFields && typeof acfFields.name_ja === "string" ? acfFields.name_ja.trim() : "") ||
    (acfFields && typeof acfFields.name_en === "string" ? acfFields.name_en.trim() : "");
  if (!name && typeof o.name === "string") name = stripHtml(o.name).trim();
  if (!name && typeof o.title === "object" && o.title !== null && "rendered" in o.title) {
    name = stripHtml(String((o.title as { rendered?: unknown }).rendered ?? "")).trim();
  }
  if (!name && typeof o.title === "string") name = stripHtml(o.title).trim();
  if (!name && typeof o.post_title === "string") name = stripHtml(o.post_title).trim();

  // slug: acf.slug → slug → post_name
  const slug =
    (acfFields && typeof acfFields.slug === "string" ? acfFields.slug.trim() : "") ||
    (typeof o.slug === "string" ? o.slug.trim() : "") ||
    (typeof o.post_name === "string" ? o.post_name.trim() : "");

  return name ? { name, slug } : undefined;
};

/**
 * ACF `director` の表記ゆれ（文字列 / 配列 / person CPT オブジェクト）を
 * name + slug エントリの配列へ正規化する。
 */
const collectDirectorEntriesFromAcf = (raw: unknown): { name: string; slug: string }[] => {
  if (raw == null) return [];
  if (typeof raw === "string") {
    return raw
      .split(/[,、\n|]/)
      .map((s) => ({ name: stripHtml(s).trim(), slug: "" }))
      .filter((e) => e.name.length > 0);
  }
  // 単一オブジェクト（person CPT post_object フィールド）
  if (!Array.isArray(raw) && typeof raw === "object" && raw !== null) {
    const info = extractPersonInfoFromObject(raw as Record<string, unknown>);
    return info ? [info] : [];
  }
  if (Array.isArray(raw)) {
    const out: { name: string; slug: string }[] = [];
    for (const item of raw) {
      if (typeof item === "string") {
        const n = stripHtml(item).trim();
        if (n) out.push({ name: n, slug: "" });
        continue;
      }
      if (item && typeof item === "object") {
        const info = extractPersonInfoFromObject(item as Record<string, unknown>);
        if (info) out.push(info);
      }
    }
    return out;
  }
  return [];
};

/** 監督名を ACF フィールドから集め、重複除去してクレジット行を返す。person CPT の場合は /person/{slug} を href に設定する。 */
export const mapCreditsFromParsedWp = (wp: ParsedWPPost, locale: string): TCreditEntry[] | undefined => {
  const acf = wp.acf as Record<string, unknown> | undefined;
  const entries = collectDirectorEntriesFromAcf(acf?.director);
  if (entries.length === 0) return undefined;
  const seen = new Set<string>();
  const names: TCreditEntry["names"] = [];
  for (const entry of entries) {
    const k = entry.name.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    names.push({ name: entry.name, ...(entry.slug ? { href: `/person/${entry.slug}` } : {}) });
  }
  if (names.length === 0) return undefined;
  const role = locale === "en" ? "Director" : "監督";
  return [{ role, names }];
};

/**
 * ACF リピータ1行の `actor`（リレーション）から表示名を取る。
 * 純粋な数値 ID のみは解決不能のため `undefined`。
 * person CPT オブジェクトの場合は acf.name_ja / acf.name_en を優先する。
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
    const info = extractPersonInfoFromObject(raw as Record<string, unknown>);
    return info?.name || undefined;
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
    // actor が person CPT オブジェクトの場合、slug から /person/{slug} URL を解決する
    if (!actorUrl && typeof ext.actor === "object" && ext.actor !== null && !Array.isArray(ext.actor)) {
      const personInfo = extractPersonInfoFromObject(ext.actor as Record<string, unknown>);
      if (personInfo) {
        if (!nameStr) nameStr = personInfo.name;
        if (personInfo.slug) actorUrl = `/person/${personInfo.slug}`;
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
    const linkToCharacter = Boolean(Number(ext.link_to_character));
    const characterTermId =
      ext.character_term != null && ext.character_term !== ""
        ? Number(ext.character_term) || null
        : null;
    if (!displayCharacter && !nameStr && !descStr) continue;
    out.push({
      ...(displayCharacter ? { character: displayCharacter } : {}),
      ...(nameStr ? { actorName: nameStr } : {}),
      ...(actorUrl ? { actorUrl } : {}),
      ...(descStr ? { description: descStr } : {}),
      ...(linkToCharacter ? { linkToCharacter } : {}),
      ...(linkToCharacter && characterTermId != null ? { characterTermId } : {}),
    });
  }

  return out.length > 0 ? out : undefined;
};
