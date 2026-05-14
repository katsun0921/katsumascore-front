// ISR: revalidate 3600s — CPT person ページ（プロフィール / 出演作品 / 監督作品 / 平均スコア）
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { PersonTemplate } from '@/components/templates/PersonTemplate';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { normalizeRouteLocale } from '@/libs/route';
import { loadPersonPage } from '@/libs/loadPersonPage';
import type { Person } from '@/types/entity';
import type { Post } from '@/types/post';

type PersonPageProps = {
  person: Person;
  castPosts: Post[];
  directorPosts: Post[];
  locale: string;
};

const PersonPage = ({ person, castPosts, directorPosts, locale }: PersonPageProps) => {
  const loc = (locale ?? 'ja') as Locale;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{person.name} | KatsumaScore</title>
        <meta
          name='description'
          content={person.bio ?? `${person.name}の出演作品・監督作品 — スコアで選ぶ`}
        />
        <link rel='canonical' href={`/person/${person.slug}`} />
        <meta name='robots' content='index,follow' />
      </Head>
      <PersonTemplate
        person={person}
        castPosts={castPosts}
        directorPosts={directorPosts}
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
  const data = await loadPersonPage(slug, currentLocale);
  if ('notFound' in data) return { notFound: true };

  return {
    props: {
      person: data.person,
      castPosts: data.castPosts,
      directorPosts: data.directorPosts,
      locale: currentLocale,
    },
    revalidate: 3600,
  };
};
