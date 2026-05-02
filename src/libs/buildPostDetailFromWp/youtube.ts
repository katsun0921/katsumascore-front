/** WP が URL / ID 混在で返す trailer フィールドから YouTube の video id を取得 */
export const extractYoutubeVideoId = (raw: string | undefined): string | undefined => {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (/^[\w-]{11}$/.test(t) && !/^https?:\/\//i.test(t)) return t;
  const q = t.match(/[?&]v=([\w-]{11})/);
  if (q?.[1]) return q[1];
  const shortm = t.match(/youtu\.be\/([\w-]{11})/);
  if (shortm?.[1]) return shortm[1];
  const emb = t.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (emb?.[1]) return emb[1];
  const sh = t.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (sh?.[1]) return sh[1];
  return undefined;
};
