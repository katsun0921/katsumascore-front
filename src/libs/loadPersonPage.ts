/**
 * `/person/[slug]` ページ用データ取得。
 * person CPT をスラッグで解決し、関連出演作品・監督作品を合わせて返す。
 * WP 側の cast / director relationship フィールドが未設定の間は relatedPosts が空になる。
 */
import { getPersonBySlug } from "@/libs/api/wordpress";
import { toSerializableValue } from "@/utils/toSerializableValue";
import type { Person } from "@/types/entity";
import type { Post } from "@/types/post";

export type PersonPageResult =
  | { notFound: true }
  | {
      person: Person;
      castPosts: Post[];
      directorPosts: Post[];
    };

/** スラッグから person を取得し、出演作品・監督作品とともに返す。 */
export const loadPersonPage = async (
  slug: string,
  locale: string,
): Promise<PersonPageResult> => {
  const lang = locale === "en" ? "en" : "ja";
  const person = await getPersonBySlug(slug, lang);
  if (!person) return { notFound: true };

  return {
    person: toSerializableValue(person),
    castPosts: [],
    directorPosts: [],
  };
};
