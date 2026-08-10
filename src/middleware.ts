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

/**
 * `/ja/genre/{slug}` `/ja/tag/{slug}` 形式。`?p=2+` を内部的に `.../p/N` へ rewrite する。
 *
 * ページネーションの正規 URL は `?p=N` に一本化している（`/p/N` は 301 で寄せる）。
 * ページ実装は SSG のため `getStaticProps` からクエリを読めない。
 * URL は `?p=N` のまま、内部で既存の `/p/[p]` ルートへ渡す。
 */
const matchLocaleTaxonomyArchive = (
  pathname: string,
  nextLocale?: 'ja' | 'en',
): { locale: 'ja' | 'en'; taxonomy: 'genre' | 'tag'; slug: string } | null => {
  const parts = pathname.split('/').filter(Boolean);

  // i18n 有効時、`/ja/genre/foo` でも pathname が `/genre/foo` で渡ることがあるため
  // 接頭辞あり・なしの両方を受ける（`nextUrl.locale` を補完に使う）
  const hasPrefix = parts[0] === 'ja' || parts[0] === 'en';
  const rest = hasPrefix ? parts.slice(1) : parts;
  const locale = hasPrefix ? (parts[0] as 'ja' | 'en') : nextLocale;

  if (locale === undefined) return null;
  if (rest.length !== 2) return null;
  if (rest[0] !== 'genre' && rest[0] !== 'tag') return null;
  return { locale, taxonomy: rest[0], slug: rest[1] };
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

  // ロケール未指定（defaultロケール）の場合、/ja へリダイレクト
  if (resolveNextLocale(request.nextUrl.locale) === undefined) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/ja' : `/ja${pathname}`;
    return NextResponse.redirect(url);
  }

  // genre / tag の `?p=N`（N>=2）を内部的に `/p/N` ルートへ渡す。
  // URL は `?p=N` のまま（正規URL）で、ページ実装は既存の SSG を使う
  const taxonomyArchive = matchLocaleTaxonomyArchive(
    pathname,
    resolveNextLocale(request.nextUrl.locale),
  );
  if (taxonomyArchive) {
    const pRaw = request.nextUrl.searchParams.get('p');
    const pNum = pRaw ? Number.parseInt(pRaw, 10) : NaN;
    if (Number.isFinite(pNum) && pNum >= 2) {
      const url = request.nextUrl.clone();
      url.pathname = `/${taxonomyArchive.locale}/${taxonomyArchive.taxonomy}/${taxonomyArchive.slug}/p/${pNum}`;
      url.searchParams.delete('p');
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

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
    /**
     * i18n 有効時、`/ja/vod/netflix` でも middleware には `pathname=/vod/netflix`・`locale=ja` で届く。
     * 解決済みロケールが ja/en ならリダイレクトはせず、`?page=N` を `/[locale]/vod/[slug]/page/N` へ rewrite する
     * （これを行わないと直接アクセス時に `?page` が無視され、常に 1 ページ目が表示される）。
     */
    const resolvedLocale = resolveNextLocale(request.nextUrl.locale);
    if (resolvedLocale !== undefined) {
      const pageRaw = request.nextUrl.searchParams.get('page');
      const pageNum = pageRaw ? Number.parseInt(pageRaw, 10) : NaN;
      if (Number.isFinite(pageNum) && pageNum >= 2) {
        const url = request.nextUrl.clone();
        url.pathname = `/${resolvedLocale}/vod/${vodUnprefixed.slug}/page/${pageNum}`;
        url.searchParams.delete('page');
        return NextResponse.rewrite(url);
      }
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
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|server-sitemap\\.xml|feed|api/).*)',
  ],
};
