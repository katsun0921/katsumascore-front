import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ARCHIVE_SEGMENTS = new Set(['movie', 'anime', 'drama']);

type ArchiveMatch = { seg: string; localeEn: boolean };

const matchPostTypeArchiveRoot = (pathname: string): ArchiveMatch | null => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  if (parts[0] === 'en') {
    if (parts.length !== 2) return null;
    const seg = parts[1];
    if (!ARCHIVE_SEGMENTS.has(seg)) return null;
    return { seg, localeEn: true };
  }

  if (parts.length !== 1) return null;
  const seg = parts[0];
  if (!ARCHIVE_SEGMENTS.has(seg)) return null;
  return { seg, localeEn: false };
};

export const middleware = (request: NextRequest) => {
  const parsed = matchPostTypeArchiveRoot(request.nextUrl.pathname);
  if (!parsed) return NextResponse.next();

  const pageRaw = request.nextUrl.searchParams.get('page');
  if (!pageRaw) return NextResponse.next();

  const pageNum = Number.parseInt(pageRaw, 10);
  if (!Number.isFinite(pageNum) || pageNum < 2) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = parsed.localeEn ? `/en/${parsed.seg}/page/${pageNum}` : `/${parsed.seg}/page/${pageNum}`;
  url.searchParams.delete('page');

  return NextResponse.rewrite(url);
};

export const config = {
  matcher: [
    '/movie',
    '/movie/',
    '/en/movie',
    '/en/movie/',
    '/anime',
    '/anime/',
    '/en/anime',
    '/en/anime/',
    '/drama',
    '/drama/',
    '/en/drama',
    '/en/drama/',
  ],
};
