import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { I18nProvider } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { Locale } from '@/i18n/t';
import { searchPageMessages } from '@/i18n/searchPageMessages';
import { searchPosts, mapWPPostToPost } from '@/lib/api/wordpress';
import { ListTemplate } from '@/components/templates/ListTemplate';
import { SeoHead } from '@/components/features/seo/SeoHead';
import type { Post } from '@/types/post';

const SearchPage = () => {
  const router = useRouter();
  const locale = (router.locale ?? 'ja') as Locale;
  const lang = locale === 'en' ? 'en' : 'ja';

  const q = useMemo(() => {
    const raw = router.query.q;
    return typeof raw === 'string' ? raw.trim() : '';
  }, [router.query.q]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const displayPosts = q ? posts : [];
  const displayLoading = !router.isReady || (q.length > 0 && loading);

  useEffect(() => {
    if (!router.isReady || !q) return;

    let cancelled = false;
    // CSR: show loading until searchPosts resolves (sync setState in effect is required here)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch lifecycle
    setLoading(true);

    searchPosts(q, lang)
      .then((raw) => {
        if (cancelled) return;
        const mapped = raw
          .map((item) => mapWPPostToPost(item))
          .filter((m): m is NonNullable<typeof m> => m !== null)
          .map((m) => {
            const { content, ...rest } = m;
            void content;
            return rest;
          });
        setPosts(mapped);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router.isReady, q, lang]);

  const categoryName = t(searchPageMessages, ['pageTitle'], locale);
  const categoryDescription = t(searchPageMessages, ['categoryDescription'], locale);
  const pageTitle = q ? `${categoryName}: ${q}` : categoryName;
  const pageDescription = q
    ? t(searchPageMessages, ['categoryDescription'], locale)
    : undefined;

  return (
    <I18nProvider locale={locale}>
      <SeoHead noIndex pageTitle={pageTitle} pageDescription={pageDescription} />
      <div className='min-h-[40vh] px-4 py-6 bg-[var(--color-bg)]'>
        {displayLoading ? (
          <p className='text-sm text-[var(--color-text-secondary)]'>
            {t(searchPageMessages, ['loading'], locale)}
          </p>
        ) : null}
        {!displayLoading && !q ? (
          <p className='text-sm text-[var(--color-text-secondary)]'>
            {t(searchPageMessages, ['emptyQuery'], locale)}
          </p>
        ) : null}
        {!displayLoading && q && displayPosts.length === 0 ? (
          <p className='text-sm text-[var(--color-text-secondary)]'>
            {t(searchPageMessages, ['emptyResults'], locale)}
          </p>
        ) : null}
      </div>
      <ListTemplate
        categoryName={categoryName}
        categoryDescription={categoryDescription}
        posts={displayPosts}
        isLoading={displayLoading}
      />
    </I18nProvider>
  );
};

export default SearchPage;
