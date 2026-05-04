import type { ParsedWPPost } from "@/libs/api/wordpress";

import { HTTP_URL_RE } from "./constants";

/** 本番 ACF は `is_cinema_showing` がルートに無く `cinema_info_filed` 内にあることが多い */
export const resolveIsCinemaShowing = (
  acfRoot: ParsedWPPost["acf"],
  acfRecord: Record<string, unknown> | undefined,
): boolean => {
  const fromRoot = acfRoot?.is_cinema_showing;
  const group = acfRecord?.cinema_info_filed;
  const fromNested =
    group && typeof group === "object" && "is_cinema_showing" in group
      ? (group as { is_cinema_showing?: unknown }).is_cinema_showing
      : undefined;
  const v = fromRoot ?? fromNested;
  if (v === true || v === 1 || v === "1") return true;
  return false;
};

/** `cinema_info_filed.cinema_list_filed` から http(s) の劇場ページ URL を取り出す。 */
export const cinemaUrlFromCinemaInfoFiled = (acfRecord: Record<string, unknown> | undefined): string | undefined => {
  const group = acfRecord?.cinema_info_filed;
  if (!group || typeof group !== "object") return undefined;
  const raw = (group as { cinema_list_filed?: unknown }).cinema_list_filed;
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  if (!HTTP_URL_RE.test(t)) return undefined;
  return t;
};
