// SSG: 検索シェルを静的生成し、検索結果は client-side fetch
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { I18nProvider } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { Locale } from '@/i18n/t';
import { searchPageMessages } from '@/i18n/searchPageMessages';
import { mapWPPostToPost } from '@/libs/api/wordpress';

const searchPostsClient = async (query: string, lang: string): Promise<unknown[]> => {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}`);
  if (!res.ok) return [];
  return res.json();
};
import { SearchResultTemplate } from '@/components/templates/SearchResultTemplate';
import { SeoHead } from '@/components/features/seo/SeoHead';
import {
  prepareSearchResults,
  type SearchDimensionFilter,
} from '@/libs/searchRelevance';

const DIMENSION_VALUES: SearchDimensionFilter[] = ['all', 'actor', 'director', 'genre'];

const isSearchDimension = (v: string): v is SearchDimensionFilter =>
  DIMENSION_VALUES.includes(v as SearchDimensionFilter);

const SearchPage = () => {
  const router = useRouter();
  const locale = (router.locale ?? 'ja') as Locale;
  const lang = locale === 'en' ? 'en' : 'ja';

  const q = useMemo(() => {
    const raw = router.query.q;
    return typeof raw === 'string' ? raw.trim() : '';
  }, [router.query.q]);

  const [rawHits, setRawHits] = useState<unknown[]>([]);
  const [dimension, setDimension] = useState<SearchDimensionFilter>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady || !q) {
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- CSR 検索: 再取得前に一覧を空にする
    setRawHits([]);
    setLoading(true);

    searchPostsClient(q, lang)
      .then((raw) => {
        if (cancelled) return;
        setRawHits(raw);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router.isReady, q, lang]);

  const posts = useMemo(() => {
    if (!q) return [];
    const prepared = prepareSearchResults(rawHits, q, dimension);
    return prepared
      .map(({ wp }) => mapWPPostToPost(wp))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .map((m) => {
        const { content, ...rest } = m;
        void content;
        return rest;
      });
  }, [rawHits, q, dimension]);

  const displayLoading = !router.isReady || (q.length > 0 && loading);

  const categoryName = t(searchPageMessages, ['pageTitle'], locale);
  const categoryDescription = t(searchPageMessages, ['categoryDescription'], locale);
  const pageTitle = q ? `${categoryName}: ${q}` : categoryName;
  const pageDescription = q
    ? t(searchPageMessages, ['categoryDescription'], locale)
    : undefined;

  const filterOptions = useMemo(
    () => [
      { value: 'all', label: t(searchPageMessages, ['filters', 'all'], locale) },
      { value: 'actor', label: t(searchPageMessages, ['filters', 'actor'], locale) },
      { value: 'director', label: t(searchPageMessages, ['filters', 'director'], locale) },
      { value: 'genre', label: t(searchPageMessages, ['filters', 'genre'], locale) },
    ],
    [locale],
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t(searchPageMessages, ['breadcrumb', 'home'], locale), href: '/' },
      { label: categoryName },
    ],
    [locale, categoryName],
  );

  return (
    <I18nProvider locale={locale}>
      <SeoHead noIndex pageTitle={pageTitle} pageDescription={pageDescription} />
      <SearchResultTemplate
        breadcrumbItems={breadcrumbItems}
        categoryLabel={t(searchPageMessages, ['category', 'label'], locale)}
        heading={pageTitle}
        description={categoryDescription}
        query={q}
        posts={posts}
        filterOptions={filterOptions}
        activeFilter={dimension}
        onFilterSelect={(v) => {
          if (isSearchDimension(v)) setDimension(v);
        }}
        isLoading={displayLoading}
        loadingMessage={t(searchPageMessages, ['loading'], locale)}
        emptyQueryMessage={t(searchPageMessages, ['emptyQuery'], locale)}
        emptyResultsMessage={t(searchPageMessages, ['emptyResults'], locale)}
      />
    </I18nProvider>
  );
};

export default SearchPage;
