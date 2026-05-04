import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const POST_TYPE_ARCHIVE_SEGMENTS = new Set(['movie', 'anime', 'drama']);
const VOD_ROOT_SEGMENT = 'vod';

type PostArchiveMatch = { seg: string; locale?: 'ja' | 'en' };

const resolveNextLocale = (locale: string): 'ja' | 'en' | undefined => {
  if (locale === 'ja' || locale === 'en') return locale;
  return undefined;
};

const matchPostTypeArchiveRoot = (
  pathname: string,
  nextLocale?: 'ja' | 'en',
): PostArchiveMatch | null => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  if (parts[0] === 'ja' || parts[0] === 'en') {
    if (parts.length !== 2) return null;
    const seg = parts[1];
    if (!POST_TYPE_ARCHIVE_SEGMENTS.has(seg) && seg !== VOD_ROOT_SEGMENT) return null;
    return { seg, locale: parts[0] };
  }

  if (parts.length !== 1) return null;
  const seg = parts[0];
  if (!POST_TYPE_ARCHIVE_SEGMENTS.has(seg) && seg !== VOD_ROOT_SEGMENT) return null;
  return { seg, locale: nextLocale };
};

/** `/ja/vod/netflix` 形式。`?page=2+` は `.../page/N` へ rewrite する対象。 */
const matchLocaleVodSlugArchive = (pathname: string): { locale: 'ja' | 'en'; slug: string } | null => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 3) return null;
  if (parts[0] !== 'ja' && parts[0] !== 'en') return null;
  if (parts[1] !== VOD_ROOT_SEGMENT) return null;
  return { locale: parts[0], slug: parts[2] };
};

/**
 * `/vod/netflix` のように URL にロケールが無いパスだけを拾う。
 * i18n 有効時、ミドルウェアには `/ja/vod/netflix` 相当でも `pathname` が `/vod/netflix` で渡ることがあり、
 * ここで `/ja/...` へリダイレクトすると無限ループになるため、`/ja/`・`/en/` で始まる pathname は除外する。
 */
const matchUnprefixedVodSlug = (pathname: string): { slug: string } | null => {
  if (pathname.startsWith('/ja/') || pathname.startsWith('/en/')) return null;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 2) return null;
  if (parts[0] !== VOD_ROOT_SEGMENT) return null;
  if (parts[1] === 'ja' || parts[1] === 'en') return null;
  return { slug: parts[1] };
};

export const middleware = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  const vodSlug = matchLocaleVodSlugArchive(pathname);
  if (vodSlug) {
    const pageRaw = request.nextUrl.searchParams.get('page');
    const pageNum = pageRaw ? Number.parseInt(pageRaw, 10) : NaN;
    if (Number.isFinite(pageNum) && pageNum >= 2) {
      const url = request.nextUrl.clone();
      url.pathname = `/${vodSlug.locale}/vod/${vodSlug.slug}/page/${pageNum}`;
      url.searchParams.delete('page');
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const vodUnprefixed = matchUnprefixedVodSlug(pathname);
  if (vodUnprefixed) {
    /** `pathname` が `/vod/slug` で来ても、解決済みロケールが ja/en ならリダイレクトしない（上記と同様のループ防止）。 */
    if (resolveNextLocale(request.nextUrl.locale) !== undefined) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/ja/vod/${vodUnprefixed.slug}`;
    return NextResponse.redirect(url);
  }

  const parsed = matchPostTypeArchiveRoot(pathname, resolveNextLocale(request.nextUrl.locale));
  if (!parsed) return NextResponse.next();

  const locale = parsed.locale ?? 'ja';

  if (parsed.seg === VOD_ROOT_SEGMENT) {
    if (!parsed.locale) {
      const url = request.nextUrl.clone();
      url.pathname = `/ja/${VOD_ROOT_SEGMENT}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const pageRaw = request.nextUrl.searchParams.get('page');
  const pageNum = pageRaw ? Number.parseInt(pageRaw, 10) : NaN;

  if (Number.isFinite(pageNum) && pageNum >= 2) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/${parsed.seg}/page/${pageNum}`;
    url.searchParams.delete('page');
    return NextResponse.rewrite(url);
  }

  if (!parsed.locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/ja/${parsed.seg}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/movie',
    '/movie/',
    '/ja/movie',
    '/ja/movie/',
    '/en/movie',
    '/en/movie/',
    '/anime',
    '/anime/',
    '/ja/anime',
    '/ja/anime/',
    '/en/anime',
    '/en/anime/',
    '/drama',
    '/drama/',
    '/ja/drama',
    '/ja/drama/',
    '/en/drama',
    '/en/drama/',
    '/vod',
    '/vod/',
    '/vod/:slug',
    '/ja/vod',
    '/ja/vod/',
    '/ja/vod/:slug',
    '/en/vod',
    '/en/vod/',
    '/en/vod/:slug',
    '/ja/vod/:slug/page/:page',
    '/en/vod/:slug/page/:page',
  ],
};
