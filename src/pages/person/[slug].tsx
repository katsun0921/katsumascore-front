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
import { t, type Locale } from '@/i18n/t';
import { messages } from '@/components/templates/PersonTemplate/i18n';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

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

/** 編集部が手動選定した代表作品（notablePostIds）を、選定順で出演・監督作品一覧から抽出する。 */
const pickNotableWorks = (posts: PersonRelatedPost[], notablePostIds: number[]): PersonRelatedPost[] => {
  const byId = new Map(posts.map((post) => [post.id, post]));
  return notablePostIds
    .map((id) => byId.get(String(id)))
    .filter((post): post is PersonRelatedPost => !!post);
};

const PersonPage = ({ person, posts, notableWorks, recommendedWorks, locale }: PersonPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  const displayName = loc === 'en'
    ? (person.nameEn || person.nameJa)
    : (person.nameJa || person.nameEn);
  const altName = loc === 'en' ? person.nameJa : person.nameEn;
  /** ロケールに応じた版を選ぶ。手動翻訳が未入力の場合は空文字を返す（日本語へのフォールバックはしない） */
  const pick = (ja: string, en: string) => (loc === 'en' ? en : ja);
  const aiSummary = pick(person.aiSummary, person.aiSummaryEn);
  const description = aiSummary
    ? aiSummary.slice(0, 120)
    : `${displayName}${t(messages, ['meta', 'fallbackDescription'], loc)}`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: loc === 'en' ? 'Person' : '人物', href: '/person' },
    { label: displayName, href: getEntityUrl('person', person.slug, loc) },
  ];

  const jaUrl = `${SITE_URL}${getEntityUrl('person', person.slug, 'ja')}`;
  const enUrl = `${SITE_URL}${getEntityUrl('person', person.slug, 'en')}`;
  const canonicalUrl = loc === 'en' ? enUrl : jaUrl;

  const sameAs = person.officialSns.map((sns) => sns.url);
  /** 手動翻訳が未入力の賞（awardName が空）はJSON-LDから除外する */
  const awardTexts = person.awards
    .map((award) => {
      const awardName = pick(award.awardName, award.awardNameEn);
      if (!awardName) return null;
      const workTitle = pick(award.workTitle, award.workTitleEn);
      return [award.year, awardName, workTitle ? `『${workTitle}』` : '']
        .filter(Boolean)
        .join(' ');
    })
    .filter((text): text is string => !!text);

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.nameJa,
    alternateName: person.nameEn,
    description: aiSummary || undefined,
    ...(person.birthDate ? { birthDate: person.birthDate } : {}),
    ...(person.deathDate ? { deathDate: person.deathDate } : {}),
    ...(person.nationality.length > 0 ? { nationality: person.nationality.join('、') } : {}),
    ...(person.officialUrl ? { url: person.officialUrl } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(awardTexts.length > 0 ? { award: awardTexts } : {}),
  };

  /** 手動翻訳が未入力のFAQ（question/answerが空）はJSON-LDから除外する */
  const faqEntries = person.faq
    .map((item) => ({
      name: pick(item.question, item.questionEn),
      text: pick(item.answer, item.answerEn),
    }))
    .filter((entry) => !!entry.name && !!entry.text);

  const faqJsonLd = faqEntries.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqEntries.map((entry) => ({
          '@type': 'Question',
          name: entry.name,
          acceptedAnswer: {
            '@type': 'Answer',
            text: entry.text,
          },
        })),
      }
    : null;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{altName ? `${displayName}（${altName}）| KatsumaScore` : `${displayName} | KatsumaScore`}</title>
        <meta name='description' content={description} />
        <link rel='canonical' href={canonicalUrl} />
        <link rel='alternate' hrefLang='ja' href={jaUrl} />
        <link rel='alternate' hrefLang='en' href={enUrl} />
        <link rel='alternate' hrefLang='x-default' href={jaUrl} />
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

  const person = transformPerson(wp);
  const posts = await getPostsByPersonId(wp.id, { lang: currentLocale, per_page: 100 });

  return {
    props: {
      person,
      posts,
      notableWorks: pickNotableWorks(posts, person.notablePostIds),
      recommendedWorks: pickTopScored(posts, 5),
      locale: currentLocale,
    },
    revalidate: REVALIDATE_DAILY,
  };
};
