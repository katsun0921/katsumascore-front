import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ARCHIVE_SEGMENTS = new Set(['movie', 'anime', 'drama']);

type ArchiveMatch = { seg: string; locale?: 'ja' | 'en' };

const resolveNextLocale = (locale: string): 'ja' | 'en' | undefined => {
  if (locale === 'ja' || locale === 'en') return locale;
  return undefined;
};

const matchPostTypeArchiveRoot = (
  pathname: string,
  nextLocale?: 'ja' | 'en',
): ArchiveMatch | null => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  if (parts[0] === 'ja' || parts[0] === 'en') {
    if (parts.length !== 2) return null;
    const seg = parts[1];
    if (!ARCHIVE_SEGMENTS.has(seg)) return null;
    return { seg, locale: parts[0] };
  }

  if (parts.length !== 1) return null;
  const seg = parts[0];
  if (!ARCHIVE_SEGMENTS.has(seg)) return null;
  return { seg, locale: nextLocale };
};

export const middleware = (request: NextRequest) => {
  const parsed = matchPostTypeArchiveRoot(
    request.nextUrl.pathname,
    resolveNextLocale(request.nextUrl.locale),
  );
  if (!parsed) return NextResponse.next();

  const locale = parsed.locale ?? 'ja';

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
  ],
};
