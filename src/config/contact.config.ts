/** お問い合わせ（Google フォーム）。環境変数で上書き可 */
const DEFAULT_FORM_ID = '1FAIpQLSdTrLwTHMItxAdMhZO8e8PnNevCOAJWPloTrsax386XalzZYQ';

const base = `https://docs.google.com/forms/d/e/${DEFAULT_FORM_ID}/viewform`;

export const CONTACT_FORM_EMBED_SRC =
  process.env.NEXT_PUBLIC_CONTACT_FORM_EMBED_URL ?? `${base}?embedded=true`;

export const CONTACT_FORM_VIEW_URL =
  process.env.NEXT_PUBLIC_CONTACT_FORM_URL ?? base;
