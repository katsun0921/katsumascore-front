/** お問い合わせ（Google フォーム）。URL は固定（環境変数では上書きしない）。 */
const DEFAULT_FORM_ID = "1FAIpQLSdTrLwTHMItxAdMhZO8e8PnNevCOAJWPloTrsax386XalzZYQ";

const viewFormBase = `https://docs.google.com/forms/d/e/${DEFAULT_FORM_ID}/viewform`;

/** 別タブで開くフォームの URL */
export const CONTACT_FORM_VIEW_URL = viewFormBase;

/** iframe 埋め込み用の `src` */
export const CONTACT_FORM_EMBED_SRC = `${viewFormBase}?embedded=true`;
