import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TTitleMetaProps, TStudioEntry } from "@/components/features/Post/PostTitleMeta";

export type BuildTitleMetaBlockInput = {
  parsed: ParsedWPPost;
  acf: Record<string, unknown> | undefined;
  releaseDate: string | undefined;
  officialSns: TTitleMetaProps["officialSns"];
  filmStudios: TStudioEntry[];
  productionStudios: TStudioEntry[];
};

/** PostDetail.TitleMeta 用。いずれかのソースがあればオブジェクトを返す */
export const buildTitleMetaBlock = ({
  parsed,
  acf,
  releaseDate,
  officialSns,
  filmStudios,
  productionStudios,
}: BuildTitleMetaBlockInput): Omit<TTitleMetaProps, "locale"> | undefined => {
  const hasSource =
    Boolean(parsed.acf?.official_url) ||
    Boolean(releaseDate) ||
    Boolean(officialSns) ||
    Boolean(acf?.copyright) ||
    filmStudios.length > 0 ||
    productionStudios.length > 0;

  if (!hasSource) {
    return undefined;
  }

  const meta: Omit<TTitleMetaProps, "locale"> = {};

  const officialUrlTrimmed = parsed.acf?.official_url?.trim();
  if (officialUrlTrimmed) {
    meta.officialUrl = officialUrlTrimmed;
  }

  if (typeof acf?.copyright === "string") {
    meta.copyright = acf.copyright;
  }

  if (releaseDate && releaseDate.length === 8) {
    meta.releaseDate = releaseDate;
  }

  if (officialSns) {
    meta.officialSns = officialSns;
  }

  if (filmStudios.length > 0) {
    meta.filmStudios = filmStudios;
  }

  if (productionStudios.length > 0) {
    meta.productionStudios = productionStudios;
  }

  return meta;
};
