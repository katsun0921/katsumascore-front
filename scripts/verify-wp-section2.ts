/**
 * §2 REST checks: anonymous GET, pagination headers, ja/en sample, Zod + mapWPPostToPost, latency.
 * Prefers a post with non-empty ACF object (review fields). If none in first 50:
 *   VERIFY_WP_SECTION2_RELAX_ACF=1 — validate first ja post only and exit 0 with warnings (ACF item stays manual).
 * Usage: WP_API_URL=https://... npx tsx scripts/verify-wp-section2.ts
 */
import { WPPostSchema, mapWPPostToPost, parseWPPostUnknown } from "@/libs/api/wordpress";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const normalizeBase = (raw: string | undefined): string | null => {
  const t = raw?.trim();
  if (!t) return null;
  return t.replace(/\/+$/, "");
};

const postsListUrl = (base: string, lang: string, perPage: number) =>
  `${base}/posts?per_page=${perPage}&_embed=1&acf_format=standard&lang=${lang}`;

const isAcfObject = (v: unknown): v is Record<string, unknown> =>
  v != null && typeof v === "object" && !Array.isArray(v);

const timedFetch = async (url: string) => {
  const t0 = performance.now();
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const ms = Math.round(performance.now() - t0);
  return { res, ms };
};

const pickPostWithAcfObject = (posts: unknown[]): unknown | null => {
  for (const p of posts) {
    const acf = (p as { acf?: unknown }).acf;
    if (!isAcfObject(acf)) continue;
    if (Object.keys(acf).length === 0) continue;
    return p;
  }
  return null;
};

const main = async () => {
  const base = normalizeBase(process.env.WP_API_URL);
  if (!base) {
    console.error("verify-wp-section2: set WP_API_URL (e.g. https://katsumascore.blog/wp-json/wp/v2)");
    process.exit(1);
  }

  const samples = 5;
  const latencies: number[] = [];
  for (let i = 0; i < samples; i += 1) {
    const { res, ms } = await timedFetch(postsListUrl(base, "ja", 1));
    latencies.push(ms);
    if (!res.ok) {
      console.error(
        `verify-wp-section2: expected 200, got ${res.status} (${postsListUrl(base, "ja", 1)})`,
      );
      process.exit(1);
    }
  }
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length / 2)];

  const ja = await timedFetch(postsListUrl(base, "ja", 1));
  const en = await timedFetch(postsListUrl(base, "en", 1));
  if (!ja.res.ok || !en.res.ok) {
    console.error("verify-wp-section2: ja/en GET failed", ja.res.status, en.res.status);
    process.exit(1);
  }

  const total = ja.res.headers.get("X-WP-Total");
  const totalPages = ja.res.headers.get("X-WP-TotalPages");
  if (!total || !totalPages) {
    console.error("verify-wp-section2: missing X-WP-Total or X-WP-TotalPages");
    process.exit(1);
  }

  const [jaPostsOne, enPostsOne] = await Promise.all([
    ja.res.json() as Promise<unknown[]>,
    en.res.json() as Promise<unknown[]>,
  ]);
  const jaFirst = jaPostsOne[0];
  const enFirst = enPostsOne[0];
  if (!jaFirst || !enFirst) {
    console.error("verify-wp-section2: empty posts list");
    process.exit(1);
  }

  const jaSlug = (jaFirst as { slug?: string }).slug;
  const enSlug = (enFirst as { slug?: string }).slug;
  if (jaSlug === enSlug) {
    console.warn(
      `verify-wp-section2: warning: first post slug identical for lang=ja and lang=en (${jaSlug ?? "?"}); check Polylang REST lang filter`,
    );
  }

  const listJa = await timedFetch(postsListUrl(base, "ja", 50));
  if (!listJa.res.ok) {
    console.error("verify-wp-section2: batch list failed", listJa.res.status);
    process.exit(1);
  }
  const batch = (await listJa.res.json()) as unknown[];
  let withAcf = pickPostWithAcfObject(batch);
  let acfRelaxed = false;
  if (!withAcf) {
    const msg =
      "verify-wp-section2: no post in first 50 with non-empty ACF object in REST. " +
      "WordPress may be returning acf: [] — enable ACF in REST (ACF to REST API / field group show in REST).";
    if (process.env.VERIFY_WP_SECTION2_RELAX_ACF === "1") {
      console.warn(`${msg} (RELAX_ACF: validating first ja post only.)`);
      withAcf = jaFirst;
      acfRelaxed = true;
    } else {
      console.error(msg);
      process.exit(1);
    }
  }

  const parsed = parseWPPostUnknown(withAcf);
  if (!parsed) {
    const z = WPPostSchema.safeParse(withAcf);
    console.error(
      acfRelaxed
        ? "verify-wp-section2: WPPostSchema failed for first ja post"
        : "verify-wp-section2: WPPostSchema failed for post with ACF object",
    );
    if (!z.success) console.error(JSON.stringify(z.error.issues.slice(0, 12), null, 2));
    process.exit(1);
  }

  const mapped = mapWPPostToPost(withAcf);
  if (!mapped) {
    console.error("verify-wp-section2: mapWPPostToPost returned null");
    process.exit(1);
  }

  const rawAcf = (withAcf as { acf?: unknown }).acf;
  const hasReviewScore =
    isAcfObject(rawAcf) &&
    rawAcf.review_score != null &&
    rawAcf.review_score !== "";
  if (!acfRelaxed && !hasReviewScore) {
    console.warn(
      "verify-wp-section2: warning: sampled post has ACF keys but no review_score; pick another post or confirm field name",
    );
  }
  if (acfRelaxed) {
    console.warn(
      "verify-wp-section2: warning: RELAX_ACF — ACF/review fields in REST not verified; complete after WordPress exposes acf objects.",
    );
  }

  const timeoutMs = 3000;
  if (p50 > timeoutMs) {
    console.warn(
      `verify-wp-section2: warning: p50 latency ${p50}ms exceeds wpFetch default timeout ${timeoutMs}ms; consider WpFetchOptions`,
    );
  }

  console.log("verify-wp-section2: OK");
  console.log(`  X-WP-Total: ${total}, X-WP-TotalPages: ${totalPages}`);
  console.log(
    `  Latency ${samples}× GET ja: min ${latencies[0]}ms, p50 ~${p50}ms, max ${latencies[latencies.length - 1]}ms`,
  );
  console.log(
    `  Validated post: id=${parsed.id} slug=${parsed.slug} score=${mapped.score ?? "—"} review_score(raw)=${hasReviewScore ? String((rawAcf as { review_score?: unknown }).review_score) : "—"}`,
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
