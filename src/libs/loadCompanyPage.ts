/**
 * `/company/[slug]` ページ用データ取得。
 * company CPT をスラッグで解決し、関連制作作品・配給作品を合わせて返す。
 * WP 側の production_companies / distributors relationship フィールドが未設定の間は
 * relatedPosts が空になる。
 */
import { getCompanyBySlug } from "@/libs/api/wordpress";
import { toSerializableValue } from "@/utils/toSerializableValue";
import type { Company } from "@/types/entity";
import type { Post } from "@/types/post";

export type CompanyPageResult =
  | { notFound: true }
  | {
      company: Company;
      productionPosts: Post[];
      distributorPosts: Post[];
    };

/** スラッグから company を取得し、制作作品・配給作品とともに返す。 */
export const loadCompanyPage = async (
  slug: string,
  locale: string,
): Promise<CompanyPageResult> => {
  const lang = locale === "en" ? "en" : "ja";
  const company = await getCompanyBySlug(slug, lang);
  if (!company) return { notFound: true };

  return {
    company: toSerializableValue(company),
    productionPosts: [],
    distributorPosts: [],
  };
};
