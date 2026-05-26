// ISR: revalidate 86400s (24h) — person 一覧ページ
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import type { GetStaticProps } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { Pagination } from '@/components/features/Pagination';
import { I18nProvider } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { Locale } from '@/i18n/t';
import { getPersonsByRole, transformPerson } from '@/libs/api/wordpress';
import { getEntityUrl, normalizeRouteLocale } from '@/libs/route';
import type { Person } from '@/libs/api/wordpress/transform';

const PER_PAGE = 20;

const messages = {
  page: {
    heading: { ja: '人物', en: 'Person' },
    description: { ja: '俳優・監督一覧', en: 'Actors and directors' },
  },
  breadcrumb: {
    home: { ja: 'ホーム', en: 'Home' },
  },
} as const;

type PersonListPageProps = {
  persons: Person[];
  locale: string;
};

const PersonListPage = ({ persons, locale }: PersonListPageProps) => {
  const loc = normalizeRouteLocale(locale) as Locale;
  const [currentPage, setCurrentPage] = useState(1);

  const heading = t(messages, ['page', 'heading'], loc);
  const description = t(messages, ['page', 'description'], loc);

  const totalPages = Math.ceil(persons.length / PER_PAGE);
  const pagedPersons = persons.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${heading} | KatsumaScore`}</title>
        <meta name='description' content={description} />
      </Head>
      <PageLayout>
        <div className='mx-auto max-w-screen-lg px-4 py-6'>
          <Breadcrumb
            items={[
              { label: t(messages, ['breadcrumb', 'home'], loc), href: '/' },
              { label: heading },
            ]}
          />
          <h1 className='mt-6 text-2xl font-bold'>{heading}</h1>
          <ul className='mt-6 divide-y divide-[var(--color-border-muted)]'>
            {pagedPersons.map((person) => {
              const name = loc === 'en' ? person.nameEn : person.nameJa;
              const href = getEntityUrl('person', person.slug, loc);
              return (
                <li key={person.id}>
                  <Link
                    href={href}
                    className='block py-3 text-sm text-color-primary no-underline hover:underline'
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
          {totalPages > 1 && (
            <div className='mt-8'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default PersonListPage;

export const getStaticProps: GetStaticProps<PersonListPageProps> = async ({ locale }) => {
  const currentLocale = normalizeRouteLocale(locale);

  const [actors, directors] = await Promise.all([
    getPersonsByRole('actor', 100),
    getPersonsByRole('director', 100),
  ]);

  const seenIds = new Set<number>();
  const persons: Person[] = [];
  for (const wp of [...actors, ...directors]) {
    if (seenIds.has(wp.id)) continue;
    seenIds.add(wp.id);
    persons.push(transformPerson(wp));
  }

  return {
    props: {
      persons,
      locale: currentLocale,
    },
    revalidate: 60 * 60 * 24,
  };
};
