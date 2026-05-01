import createClient from "openapi-fetch";
import type { paths } from "./generated/wp-schema";

const normalizeWpApiBaseUrl = (raw: string | undefined): string | undefined => {
  const t = raw?.trim();
  if (!t) return undefined;
  return t.replace(/\/+$/, "");
};

/** OpenAPI クライアントと生 fetch の共通ベース（通常 `.../wp-json/wp/v2`） */
export const wpApiBaseUrl = normalizeWpApiBaseUrl(process.env.WP_API_URL);

/** `_embed` / `acf_format` を既定値として付与するミドルウェア */
const defaultParamsMiddleware: Parameters<
  ReturnType<typeof createClient<paths>>["use"]
>[0] = {
  onRequest({ request }) {
    const url = new URL(request.url);
    if (!url.searchParams.has("_embed")) url.searchParams.set("_embed", "1");
    if (!url.searchParams.has("acf_format")) url.searchParams.set("acf_format", "standard");
    return new Request(url.toString(), request);
  },
};

const buildClient = () => {
  if (!wpApiBaseUrl) return null;
  const client = createClient<paths>({ baseUrl: wpApiBaseUrl });
  client.use(defaultParamsMiddleware);
  return client;
};

export const wpClient = buildClient();

export type WpFetchOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  initialBackoffMs?: number;
};

export const defaultFetchOptions: Required<WpFetchOptions> = {
  timeoutMs: 3000,
  maxRetries: 2,
  initialBackoffMs: 500,
};

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const shouldRetryStatus = (status: number) => status === 429 || status >= 500;

export type WpPostsListMeta = {
  total: number;
  totalPages: number;
};

export type WpPostsPagedResult<T> = {
  items: T[];
  meta: WpPostsListMeta;
};
