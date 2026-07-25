// ISR: revalidate REVALIDATE_DAILY — person CPT 詳細ページ
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { REVALIDATE_DAILY } from '@/config/revalidate.config';
import { I18nProvider } from '@/i18n/provider';
import {
  getPersonBySlug,
  getPostsByPersonId,
  transformPerson,
} from '@/libs/api/wordpress';
import type { PersonRelatedPost } from '@/libs/api/wordpress';
import { PersonTemplate } from '@/components/templates/PersonTemplate';
import { getEntityUrl, normalizeRouteLocale } from '@/libs/route';
import type { Person } from '@/libs/api/wordpress/transform';
import type { Locale } from '@/i18n/t';

type PersonPageProps = {
  person: Person;
  posts: PersonRelatedPost[];
  notableWorks: PersonRelatedPost[];
  recommendedWorks: PersonRelatedPost[];
  locale: string;
};

/** レビュースコア上位の記事をスコア降順で抽出する。 */
const pickTopScored = (posts: PersonRelatedPost[], limit: number): PersonRelatedPost[] =>
  posts
    .filter((post) => typeof post.score === 'number')
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);

const PersonPage = ({ person, posts, notableWorks, recommendedWorks, locale }: PersonPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  const displayName = loc === 'en'
    ? (person.nameEn || person.nameJa)
    : (person.nameJa || person.nameEn);
  const altName = loc === 'en' ? person.nameJa : person.nameEn;
  const description = person.aiSummary
    ? person.aiSummary.slice(0, 120)
    : `${displayName}の出演作品・監督作品一覧`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: loc === 'en' ? 'Person' : '人物', href: '/person' },
    { label: displayName, href: getEntityUrl('person', person.slug, loc) },
  ];

  const sameAs = person.officialSns.map((sns) => sns.url);
  const awardTexts = person.awards.map((award) => (
    [award.year, award.awardName, award.workTitle ? `『${award.workTitle}』` : '']
      .filter(Boolean)
      .join(' ')
  ));

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.nameJa,
    alternateName: person.nameEn,
    description: person.aiSummary || undefined,
    ...(person.birthDate ? { birthDate: person.birthDate } : {}),
    ...(person.deathDate ? { deathDate: person.deathDate } : {}),
    ...(person.nationality.length > 0 ? { nationality: person.nationality.join('、') } : {}),
    ...(person.officialUrl ? { url: person.officialUrl } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(awardTexts.length > 0 ? { award: awardTexts } : {}),
  };

  const faqJsonLd = person.faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: person.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{altName ? `${displayName}（${altName}）| KatsumaScore` : `${displayName} | KatsumaScore`}</title>
        <meta name='description' content={description} />
        <link
          rel='canonical'
          href={`https://katsumascore.blog/person/${person.slug}`}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {faqJsonLd && (
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
      </Head>
      <PersonTemplate
        person={person}
        posts={posts}
        notableWorks={notableWorks}
        recommendedWorks={recommendedWorks}
        breadcrumbs={breadcrumbs}
      />
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

  const posts = await getPostsByPersonId(wp.id, { lang: currentLocale, per_page: 100 });

  return {
    props: {
      person: transformPerson(wp),
      posts,
      notableWorks: pickTopScored(posts, 3),
      recommendedWorks: pickTopScored(posts, 5),
      locale: currentLocale,
    },
    revalidate: REVALIDATE_DAILY,
  };
};
