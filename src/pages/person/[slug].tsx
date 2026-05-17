// ISR: revalidate 86400s (24h) — person CPT 詳細ページ
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { I18nProvider } from '@/i18n/provider';
import { getPersonBySlug } from '@/libs/api/wordpress';
import { transformPerson } from '@/libs/api/wordpress';
import { PersonTemplate } from '@/components/templates/PersonTemplate';
import { getEntityUrl, normalizeRouteLocale } from '@/libs/route';
import type { Person } from '@/libs/api/wordpress/transform';
import type { Locale } from '@/i18n/t';

type PersonPageProps = {
  person: Person;
  locale: string;
};

const PersonPage = ({ person, locale }: PersonPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  const displayName = loc === 'en' ? person.nameEn : person.nameJa;
  const altName = loc === 'en' ? person.nameJa : person.nameEn;
  const description = person.bio
    ? person.bio.slice(0, 120)
    : `${displayName}の出演作品・監督作品一覧`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: loc === 'en' ? 'Person' : '人物', href: '/person' },
    { label: displayName, href: getEntityUrl('person', person.slug, loc) },
  ];

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${displayName}（${altName}）| KatsumaScore`}</title>
        <meta name='description' content={description} />
        <link
          rel='canonical'
          href={`https://katsumascore.blog/person/${person.slug}`}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: person.nameJa,
              alternateName: person.nameEn,
              image: person.image?.url,
              description: person.bio,
            }),
          }}
        />
      </Head>
      <PersonTemplate person={person} breadcrumbs={breadcrumbs} />
    </I18nProvider>
  );
};

export default PersonPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<PersonPageProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const wp = await getPersonBySlug(slug);
  if (!wp) return { notFound: true };

  return {
    props: {
      person: transformPerson(wp),
      locale: currentLocale,
    },
    revalidate: 60 * 60 * 24,
  };
};
