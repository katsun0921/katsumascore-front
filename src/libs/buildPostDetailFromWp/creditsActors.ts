import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TActor, TCreditEntry } from "@/components/features/Post/PostTitleMeta";
import {
  stripHtml,
  extractActorLinksFromParsedWp,
  extractPersonLinksFromParsedWp,
} from "@/libs/api/wordpress";

/**
 * "日本語名 / English Name" 形式の結合文字列から locale に応じた部分を抽出する。
 * " / " 区切りがない場合はそのまま返す。EN ページでは右側（英語）、JA ページでは左側（日本語）を返す。
 */
const extractLocaleNameFromCombined = (name: string, locale?: string): string => {
  if (!name.includes(" / ")) return name;
  const parts = name.split(" / ");
  return locale === "en" ? parts[parts.length - 1].trim() : parts[0].trim();
};

/** WPPerson オブジェクト（REST API 形式 / WP_Post 形式）から name と slug を抽出する。locale に応じて name_ja / name_en の優先順位を切り替える。 */
const extractPersonInfoFromObject = (o: Record<string, unknown>, locale?: string): { name: string; slug: string } | undefined => {
  const acfFields =
    typeof o.acf === "object" && o.acf !== null ? (o.acf as Record<string, unknown>) : undefined;

  const nameJa = acfFields && typeof acfFields.name_ja === "string" ? acfFields.name_ja.trim() : "";
  const nameEn = acfFields && typeof acfFields.name_en === "string" ? acfFields.name_en.trim() : "";
  // locale === 'en' のとき name_en を優先、それ以外は name_ja を優先
  let name = locale === "en" ? nameEn || nameJa : nameJa || nameEn;
  if (!name && typeof o.name === "string") name = extractLocaleNameFromCombined(stripHtml(o.name).trim(), locale);
  if (!name && typeof o.title === "object" && o.title !== null && "rendered" in o.title) {
    name = extractLocaleNameFromCombined(stripHtml(String((o.title as { rendered?: unknown }).rendered ?? "")).trim(), locale);
  }
  if (!name && typeof o.title === "string") name = extractLocaleNameFromCombined(stripHtml(o.title).trim(), locale);
  if (!name && typeof o.post_title === "string") name = extractLocaleNameFromCombined(stripHtml(o.post_title).trim(), locale);

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
const collectDirectorEntriesFromAcf = (raw: unknown, locale?: string): { name: string; slug: string }[] => {
  if (raw == null) return [];
  if (typeof raw === "string") {
    return raw
      .split(/[,、\n|]/)
      .map((s) => ({ name: extractLocaleNameFromCombined(stripHtml(s).trim(), locale), slug: "" }))
      .filter((e) => e.name.length > 0);
  }
  // 単一オブジェクト（person CPT post_object フィールド）
  if (!Array.isArray(raw) && typeof raw === "object" && raw !== null) {
    const info = extractPersonInfoFromObject(raw as Record<string, unknown>, locale);
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
        const info = extractPersonInfoFromObject(item as Record<string, unknown>, locale);
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
  const entries = collectDirectorEntriesFromAcf(acf?.director, locale);
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
 * person CPT オブジェクトの場合は locale に応じて acf.name_ja / acf.name_en を優先する。
 */
const pickActorDisplayNameFromUnknown = (raw: unknown, locale?: string): string | undefined => {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    const t = stripHtml(raw).trim();
    if (!t) return undefined;
    if (/^\d+$/.test(t)) return undefined;
    return t;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) return undefined;
  if (typeof raw === "object") {
    const info = extractPersonInfoFromObject(raw as Record<string, unknown>, locale);
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

/** タクソノミータームオブジェクトから ACF name_ja / name_en を取得し locale に応じた表示名を返す。フォールバックは WP プライマリ name。 */
const pickTermLocaleName = (t: Record<string, unknown>, locale?: string): string => {
  const primaryName = typeof t.name === "string" ? t.name.trim() : "";
  const acf = typeof t.acf === "object" && t.acf !== null ? (t.acf as Record<string, unknown>) : undefined;
  const nameJa = acf && typeof acf.name_ja === "string" ? acf.name_ja.trim() : "";
  const nameEn = acf && typeof acf.name_en === "string" ? acf.name_en.trim() : "";
  const localeName = locale === "en" ? nameEn || nameJa : nameJa || nameEn;
  return localeName || extractLocaleNameFromCombined(primaryName, locale);
};

/** `_embedded['wp:term']` の actor/actors/person/persons ターム ID → {name, url} のマップを構築。locale に応じて acf.name_ja / acf.name_en を優先する。 */
const buildTermIdToActorInfoMap = (wp: ParsedWPPost, locale?: string): Map<number, { name: string; url: string }> => {
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
      const slug = typeof t.slug === "string" ? t.slug.trim() : "";
      if (id === undefined || !slug) continue;
      const name = pickTermLocaleName(t, locale);
      if (!name) continue;
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
 * name_ja・name_en・プライマリ name をすべてキーとして登録し、どのロケール名でも解決できるようにする。
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
      if (id === undefined) continue;

      let taxType: "actor" | "person" | undefined;
      if (tax === "actor" || tax === "actors") taxType = "actor";
      else if (tax === "person" || tax === "persons") taxType = "person";
      else continue;

      const primaryName = typeof t.name === "string" ? t.name.trim() : "";
      const acf = typeof t.acf === "object" && t.acf !== null ? (t.acf as Record<string, unknown>) : undefined;
      const nameJa = acf && typeof acf.name_ja === "string" ? acf.name_ja.trim() : "";
      const nameEn = acf && typeof acf.name_en === "string" ? acf.name_en.trim() : "";
      // ja・en・プライマリ名のすべてを登録してどのロケール名でも termId を解決できるようにする
      for (const candidate of [primaryName, nameJa, nameEn]) {
        if (candidate) map.set(candidate.toLowerCase(), { termId: id, taxType });
      }
    }
  }
  return map;
};

/** ACF 出演者行から `TActor[]` を構築する。actor/person タームへのリンクは埋め込みタームから解決する。locale に応じて name_ja / name_en を切り替える。 */
export const mapActors = (wp: ParsedWPPost, locale?: string): TActor[] | undefined => {
  const acf = wp.acf as Record<string, unknown> | undefined;
  const rows = pickActorsRowsFromAcf(acf);
  const termIdToInfo = buildTermIdToActorInfoMap(wp, locale);
  const actorLinks = extractActorLinksFromParsedWp(wp);
  const personLinks = extractPersonLinksFromParsedWp(wp);
  // person タクソノミーが actor タクソノミーより優先（後から上書き）。
  // locale-aware 名と WP プライマリ名の両方をキーに登録し、どちらの名前でも URL を解決できるようにする。
  const nameToActorUrl = new Map<string, string>();
  for (const l of actorLinks) {
    nameToActorUrl.set(l.name.toLowerCase(), `/actor/${l.slug}`);
  }
  for (const l of personLinks) {
    nameToActorUrl.set(l.name.toLowerCase(), `/person/${l.slug}`);
  }
  // locale 名でも引けるよう termIdToInfo のエントリも登録する
  for (const info of termIdToInfo.values()) {
    if (!nameToActorUrl.has(info.name.toLowerCase())) {
      nameToActorUrl.set(info.name.toLowerCase(), info.url);
    }
  }
  const out: TActor[] = [];

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const ext = row as Record<string, unknown>;
    let nameStr: string | undefined;
    let actorUrl: string | undefined;
    // actor が数値 term ID の場合、_embedded タームから locale-aware 名前・URL を最優先で解決する
    // （ext.name は日本語プレーンテキストが入ることが多いためターム解決を先行させる）
    if (typeof ext.actor === "number" && Number.isFinite(ext.actor)) {
      const info = termIdToInfo.get(ext.actor as number);
      if (info) {
        nameStr = info.name;
        actorUrl = info.url;
      }
    }
    // ターム解決できなかった場合のフォールバック（プレーンテキスト name → actor フィールド）
    if (!nameStr && typeof ext.name === "string" && ext.name.trim()) {
      nameStr = extractLocaleNameFromCombined(ext.name.trim(), locale);
    }
    if (!nameStr) {
      nameStr = pickActorDisplayNameFromUnknown(ext.actor, locale);
    }
    // actor が person CPT オブジェクトの場合、slug から /person/{slug} URL を解決する
    if (!actorUrl && typeof ext.actor === "object" && ext.actor !== null && !Array.isArray(ext.actor)) {
      const personInfo = extractPersonInfoFromObject(ext.actor as Record<string, unknown>, locale);
      if (personInfo) {
        if (!nameStr) nameStr = personInfo.name;
        if (personInfo.slug) actorUrl = `/person/${personInfo.slug}`;
      }
    }
    if (!nameStr && typeof ext.actor_name === "string" && ext.actor_name.trim()) {
      nameStr = extractLocaleNameFromCombined(ext.actor_name.trim(), locale);
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
