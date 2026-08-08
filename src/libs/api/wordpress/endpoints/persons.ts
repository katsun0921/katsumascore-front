/**
 * `/persons` CPT エンドポイントの取得ヘルパー（OpenAPI スキーマ外のため生 fetch を使用）。
 */
import { wpApiBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

/** `/persons` CPT の REST レスポンス（必要なフィールドのみ）。 */
export type WPPerson = {
  id: number;
  slug: string;
  title: { rendered: string };
  /** `_embed` 指定時のみ含まれる。国籍は `country` タクソノミーのタームとして返る */
  _embedded?: {
    "wp:term"?: {
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }[][];
  };
  acf: {
    name_ja: string;
    name_en: string;
    roles: ("actor" | "actress" | "director" | "voice_actor")[];
    birth_date?: string;
    death_date?: string;
    active_years?: string;
    gender?: "male" | "female" | "other" | "";
    official_url?: string;
    /** ACF repeater は空のとき false を返す */
    official_sns?: {
      platform: "x" | "instagram" | "youtube" | "tiktok" | "facebook" | "other";
      url: string;
    }[] | false;
    /** 編集部が手動選定した代表作品（post_object, multiple）。選定順が表示順。ACFは空のとき false を返す */
    notable_posts?: number[] | false;
    /**
     * ACF group フィールド。日本語/英語をタブで切り替える構成のため、
     * サブフィールドは `{フィールド名}_ja` / `{フィールド名}_en`
     * （英語は翻訳はAIを使用せず手動入力。未入力の場合が多い）
     */
    ai_summary?: { ai_summary_ja?: string; ai_summary_en?: string };
    ai_career?: { ai_career_ja?: string; ai_career_en?: string };
    ai_strength?: { ai_strength_ja?: string; ai_strength_en?: string };
    ai_style?: { ai_style_ja?: string; ai_style_en?: string };
    ai_theme?: { ai_theme_ja?: string; ai_theme_en?: string };
    ai_position?: { ai_position_ja?: string; ai_position_en?: string };
    ai_notable_reason?: { ai_notable_reason_ja?: string; ai_notable_reason_en?: string };
    /** ACF repeater は空のとき false を返す */
    ai_faq?: {
      question: string;
      answer: string;
      question_en?: string;
      answer_en?: string;
    }[] | false;
    /**
     * ACF repeater は空のとき false を返す。事実確認できない場合は元々空配列で返る想定。
     * award_name_en / work_title_en は翻訳をAIを使用せず手動入力（未入力の場合が多い）
     */
    ai_awards?: {
      year?: string;
      award_name?: string;
      award_name_en?: string;
      work_title?: string;
      work_title_en?: string;
      result?: "win" | "nomination" | "";
    }[] | false;
  };
};

const buildPersonsUrl = (path: string): string | null => {
  if (!wpApiBaseUrl) return null;
  return `${wpApiBaseUrl}${path}`;
};

/** 再試行付きで persons エンドポイントを fetch する。 */
const fetchPersons = async <T>(
  path: string,
  options?: WpFetchOptions,
): Promise<T | null> => {
  const url = buildPersonsUrl(path);
  if (!url) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      return (await res.json()) as T;
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** ID で person を取得する。 */
export const getPerson = async (
  id: number,
  options?: WpFetchOptions,
): Promise<WPPerson | null> =>
  fetchPersons<WPPerson>(`/persons/${id}?acf_format=standard`, options);

/** slug で person を取得する。`_embed` で国籍（`country` タクソノミー）のタームを取得する。 */
export const getPersonBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPPerson | null> => {
  const results = await fetchPersons<WPPerson[]>(
    `/persons?slug=${encodeURIComponent(slug)}&acf_format=standard&_embed=1`,
    options,
  );
  return results?.[0] ?? null;
};

/** 全 persons を取得する（サイトマップ生成などの用途）。 */
export const getPersons = async (
  perPage = 100,
  options?: WpFetchOptions,
): Promise<WPPerson[]> =>
  (await fetchPersons<WPPerson[]>(
    `/persons?acf_format=standard&per_page=${perPage}`,
    options,
  )) ?? [];

/** role で persons を取得する（actor / director）。 */
export const getPersonsByRole = async (
  role: "actor" | "director",
  perPage = 100,
  options?: WpFetchOptions,
): Promise<WPPerson[]> =>
  (await fetchPersons<WPPerson[]>(
    `/persons?acf_format=standard&per_page=${perPage}&acf[roles]=${role}`,
    options,
  )) ?? [];
