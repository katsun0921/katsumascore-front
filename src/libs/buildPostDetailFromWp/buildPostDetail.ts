import type { PostDetailData } from "@/components/templates/PostDetail/PostDetail.types";
import {
  parseWPPostUnknown,
  stripHtml,
  mapWPPostToPost,
  extractGenreLinksFromParsedWp,
  extractPostTagLinksFromParsedWp,
  extractFilmStudioLinksFromParsedWp,
  extractProductionStudioLinksFromParsedWp,
} from "@/libs/api/wordpress";

import { scalarToTrimmedString } from "./acfScalars";
import { cinemaUrlFromCinemaInfoFiled, resolveIsCinemaShowing } from "./cinema";
import { SITE_URL } from "./constants";
import { mapActors, mapCreditsFromParsedWp } from "./creditsActors";
import { splitGoodPoints } from "./goodPoints";
import { parseOfficialSns } from "./officialSns";
import { buildReviewSiteScoresFromAcf } from "./reviewSiteScores";
import { buildRentalServices, buildStreamingVods } from "./streamingRental";
import { buildTitleMetaBlock } from "./titleMeta";
import type { BuildPostDetailFromWpInput } from "./types";
import { buildVodIntroductionPayload } from "./vodIntroduction";
import { extractYoutubeVideoId } from "./youtube";

/**
 * `getStaticProps` 等から渡す WP 生データをパースし、PostDetail 向けに正規化・マージする。
 * 必須フィールドが欠ける場合は `null`。
 */
export const buildPostDetailFromWp = ({
  wp,
  locale,
  relationPosts,
  postsGroups,
  vodRelatedPosts,
}: BuildPostDetailFromWpInput): PostDetailData | null => {
  const parsed = parseWPPostUnknown(wp);
  if (!parsed) return null;
  const base = mapWPPostToPost(wp);
  if (!base) return null;

  const acf = parsed.acf as Record<string, unknown> | undefined;

  const sg = parsed.acf?.acf_summary_group as Record<string, unknown> | undefined;

  const snippetFrom = (raw: unknown): string => {
    if (typeof raw !== "string") return "";
    const t = raw.trim();
    if (!t) return "";
    return stripHtml(t);
  };

  /** グループ内・ルート ACF の両方からあらすじ本文を拾う（テーマ acf-summary.php は acf_summary_text 中心） */
  const summaryPrimaryFromFields = (): string => {
    const fromGroup =
      snippetFrom(sg?.summary_jp) ||
      snippetFrom(sg?.acf_summary_text) ||
      snippetFrom(sg?.acf_summary_text_jp);
    if (fromGroup) return fromGroup;
    if (!acf) return "";
    return snippetFrom(acf.acf_summary_text) || snippetFrom(acf.summary_jp);
  };

  const summaryAlternateFromFields = (): string => {
    const fromGroup = snippetFrom(sg?.summary_en) || snippetFrom(sg?.acf_summary_text_en);
    if (fromGroup) return fromGroup;
    if (!acf) return "";
    return snippetFrom(acf.summary_en);
  };

  const primarySummary = summaryPrimaryFromFields();
  const alternateSummary = summaryAlternateFromFields();
  const summaryText =
    locale === "en" ? alternateSummary || primarySummary : primarySummary || alternateSummary;

  const officialUrl = parsed.acf?.official_url?.trim();
  const groupRefUrl = typeof sg?.acf_ref_url === "string" ? sg.acf_ref_url.trim() : "";
  const groupRefLabelRaw = typeof sg?.acf_summary_ref === "string" ? sg.acf_summary_ref.trim() : "";
  const citeUrl = officialUrl || groupRefUrl;
  let citeLabel: string | undefined;
  if (citeUrl) {
    if (groupRefLabelRaw) citeLabel = stripHtml(groupRefLabelRaw);
    else citeLabel = locale === "en" ? "Official site" : "公式サイト";
  }

  const summary =
    summaryText.length > 0
      ? {
          text: summaryText,
          ...(citeUrl ? { refUrl: citeUrl, ...(citeLabel ? { refLabel: citeLabel } : {}) } : {}),
        }
      : undefined;

  const releaseGroup = acf?.release as Record<string, unknown> | undefined;
  const releaseDate = (
    (typeof releaseGroup?.release_date === "string" ? releaseGroup.release_date : "") ||
    parsed.acf?.release_date?.trim() ||
    ""
  ).trim() || undefined;
  const officialSnsParsed = parseOfficialSns(parsed.acf?.official_sns);
  const titleMetaFilmStudios = extractFilmStudioLinksFromParsedWp(parsed)
    .map((s) => ({ name: s.name, href: `/film_studio/${s.slug}` }));
  const titleMetaProductionStudios = extractProductionStudioLinksFromParsedWp(parsed)
    .map((s) => ({ name: s.name, href: `/production_studio/${s.slug}` }));
  const titleMeta = buildTitleMetaBlock({
    parsed,
    acf,
    releaseDate,
    officialSns: officialSnsParsed,
    filmStudios: titleMetaFilmStudios,
    productionStudios: titleMetaProductionStudios,
  });

  const metaRecord =
    parsed.meta && typeof parsed.meta === "object" && !Array.isArray(parsed.meta)
      ? (parsed.meta as Record<string, unknown>)
      : undefined;

  /** タグライン: ACF キー名は `tagline_filed` */
  const taglineRaw =
    scalarToTrimmedString(acf?.tagline_filed) ||
    scalarToTrimmedString(metaRecord?.tagline) ||
    scalarToTrimmedString(acf?.tagline);
  const authorComment = taglineRaw.length > 0 ? stripHtml(taglineRaw) : undefined;

  const videoCodeFromMeta =
    typeof metaRecord?.video_code === "string" && metaRecord.video_code.trim()
      ? metaRecord.video_code.trim()
      : undefined;
  let videoCodeFromAcf: string | undefined;
  if (typeof acf?.video_code === "string" && acf.video_code.trim()) {
    videoCodeFromAcf = acf.video_code.trim();
  } else if (typeof acf?.trailer_embed === "string" && acf.trailer_embed.trim()) {
    videoCodeFromAcf = acf.trailer_embed.trim();
  }
  const trailerEmbedCode = videoCodeFromMeta ?? videoCodeFromAcf;

  const idCandidates = [
    parsed.acf?.trailer_youtube_id,
    parsed.acf?.trailer_youtube,
    typeof acf?.youtube_id === "string" ? acf.youtube_id : undefined,
  ];
  let trailerYoutubeId: string | undefined;
  for (const c of idCandidates) {
    if (typeof c !== "string" || !c.trim()) continue;
    const id = extractYoutubeVideoId(c.trim());
    if (id) {
      trailerYoutubeId = id;
      break;
    }
  }

  const updatedAt = parsed.modified?.slice(0, 10);
  const publishedDate = parsed.date?.slice(0, 10);
  const reviewSiteScores = buildReviewSiteScoresFromAcf(acf, {
    ...(updatedAt ? { updatedAt } : {}),
    ...(publishedDate ? { publishedDate } : {}),
  });
  const goodPoints = splitGoodPoints(acf?.good_point_filed);
  const credits = mapCreditsFromParsedWp(parsed, locale);
  const actors = mapActors(parsed);
  const streamingVods = buildStreamingVods(parsed);
  const rentalServices = buildRentalServices(parsed);

  const trailerVideo: { trailerEmbedCode?: string; trailerYoutubeId?: string } = {};
  if (trailerEmbedCode) {
    trailerVideo.trailerEmbedCode = trailerEmbedCode;
  } else if (trailerYoutubeId) {
    trailerVideo.trailerYoutubeId = trailerYoutubeId;
  }

  const heroGenres = extractGenreLinksFromParsedWp(parsed);
  const heroTags = extractPostTagLinksFromParsedWp(parsed);

  const isCinemaShowing = resolveIsCinemaShowing(parsed.acf, acf);
  const cinemaListUrl = cinemaUrlFromCinemaInfoFiled(acf);
  const cinemaIntroductionOfficial = parsed.acf?.official_url?.trim();
  const cinemaIntroduction: NonNullable<PostDetailData["cinemaIntroduction"]> = {
    publishedAt: base.publishedAt,
    ...(cinemaListUrl ? { cinemaUrl: cinemaListUrl } : {}),
    ...(cinemaIntroductionOfficial ? { officialUrl: cinemaIntroductionOfficial } : {}),
  };

  const vodIntroduction = buildVodIntroductionPayload(parsed, base, acf, vodRelatedPosts);

  return {
    ...base,
    ...(updatedAt ? { updatedAt } : {}),
    ...trailerVideo,
    ...(authorComment ? { authorComment } : {}),
    ...(goodPoints ? { goodPoints } : {}),
    ...(summary ? { summary } : {}),
    ...(titleMeta ? { TitleMeta: titleMeta } : {}),
    ...(credits ? { credits } : {}),
    ...(actors ? { actors } : {}),
    isCinemaShowing,
    cinemaIntroduction,
    ...(streamingVods ? { streamingVods } : {}),
    ...(rentalServices ? { rentalServices } : {}),
    ...(relationPosts && relationPosts.length > 0 ? { relationPosts } : {}),
    ...(postsGroups && postsGroups.length > 0 ? { postsGroups } : {}),
    ...(heroGenres.length > 0 ? { heroGenres } : {}),
    ...(heroTags.length > 0 ? { heroTags } : {}),
    ...(reviewSiteScores ? { reviewSiteScores } : {}),
    ...(vodIntroduction ? { vodIntroduction } : {}),
    shareUrl: `${SITE_URL.replace(/\/$/, "")}${base.slug}`,
  };
};
