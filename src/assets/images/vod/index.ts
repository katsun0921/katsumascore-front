import abemaTv from "./abema-tv.webp";
import amazonPrimeVideo from "./amazon-prime-video.webp";
import appleTvPlus from "./apple-tv-plus.webp";
import crunchyroll from "./crunchyroll.webp";
import disneyPlus from "./disney-plus.webp";
import dmmTv from "./dmm-tv.webp";
import netflix from "./netflix.webp";
import uNext from "./u-next.webp";
import youtube from "./youtube.webp";

/** WP `vod` ターム slug から地域サフィックス（-jp / -com 等）を除いたキー → ロゴ URL（ビルド済みパス） */
export const vodLogoSrcBySlug: Record<string, string> = {
  abema_tv: abemaTv.src,
  "amazon-prime-video": amazonPrimeVideo.src,
  "apple-tv": appleTvPlus.src,
  crunchyroll: crunchyroll.src,
  disneyplus: disneyPlus.src,
  dmmtv: dmmTv.src,
  netflix: netflix.src,
  "u-next": uNext.src,
  youtube: youtube.src,
};
