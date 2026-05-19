// ISR: revalidate 86400s (24h) — person 一覧ページ
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import type { GetStaticProps } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getPersonsByRole, transformPerson } from '@/libs/api/wordpress';
import { getEntityUrl, normalizeRouteLocale } from '@/libs/route';
import type { Person } from '@/libs/api/wordpress/transform';

type PersonListPageProps = {
  persons: Person[];
  locale: string;
};

const PersonListPage = ({ persons, locale }: PersonListPageProps) => {
  const loc = normalizeRouteLocale(locale) as Locale;
  // eslint-disable-next-line katsumascore-ui/no-hardcoded-i18n
  const heading = loc === 'en' ? 'Person' : '人物';
  // eslint-disable-next-line katsumascore-ui/no-hardcoded-i18n
  const description = loc === 'en' ? 'Actors and directors' : '俳優・監督一覧';

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
              { label: 'Home', href: '/' },
              { label: heading },
            ]}
          />
          <h1 className='mt-6 text-2xl font-bold'>{heading}</h1>
          <ul className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4'>
            {persons.map((person) => {
              const name = loc === 'en' ? person.nameEn : person.nameJa;
              const href = getEntityUrl('person', person.slug, loc);
              return (
                <li key={person.id}>
                  <Link
                    href={href}
                    className='flex flex-col items-center gap-2 rounded-lg border border-color-border bg-color-bg p-4 no-underline transition-opacity hover:opacity-90'
                  >
                    {person.image ? (
                      <Image
                        src={person.image.url}
                        alt={person.image.alt}
                        width={80}
                        height={80}
                        className='rounded-full object-cover'
                      />
                    ) : (
                      <span className='flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface-2)] font-bold text-2xl text-color-secondary'>
                        {name.slice(0, 1)}
                      </span>
                    )}
                    <span className='text-center font-ui text-sm font-medium text-color-primary leading-tight'>
                      {name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
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
