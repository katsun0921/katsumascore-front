// ISR: revalidate REVALIDATE_LOW — character（キャラクター）特集ページ
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { REVALIDATE_LOW } from '@/config/revalidate.config';
import { I18nProvider } from '@/i18n/provider';
import {
  getAllCharacterSlugs,
  getCharacterBySlug,
} from '@/libs/api/wordpress/endpoints/character';
import { getPostsByCharacterTermId } from '@/libs/api/wordpress/endpoints/posts';
import { mapWPPostToPost } from '@/libs/api/wordpress';
import { CharacterTemplate } from '@/components/templates/CharacterTemplate';
import { normalizeRouteLocale } from '@/libs/route';
import type { Character } from '@/types/character';
import type { Post } from '@/types/post';
import type { Locale } from '@/i18n/t';

type CharacterPageProps = {
  character: Character;
  posts: Post[];
  locale: string;
};

const CharacterPage = ({ character, posts, locale }: CharacterPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  const description = `${character.name}が登場する作品一覧`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: loc === 'en' ? 'Character' : 'キャラクター', href: '/character' },
    { label: character.name, href: `/character/${character.slug}` },
  ];

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${character.name} | 登場作品一覧 - KatsumaScore`}</title>
        <meta name='description' content={description} />
        <link
          rel='canonical'
          href={`https://katsumascore.blog/character/${character.slug}`}
        />
        <meta property='og:title' content={`${character.name} | 登場作品一覧 - KatsumaScore`} />
        <meta property='og:description' content={description} />
        <meta property='og:type' content='website' />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: character.name,
              description,
            }),
          }}
        />
      </Head>
      <CharacterTemplate character={character} posts={posts} breadcrumbs={breadcrumbs} />
    </I18nProvider>
  );
};

export default CharacterPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllCharacterSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<CharacterPageProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const character = await getCharacterBySlug(slug);
  if (!character || character.parent === 0) return { notFound: true };

  const wpPosts = await getPostsByCharacterTermId(character.id);
  const posts = wpPosts.flatMap((wp) => {
    const post = mapWPPostToPost(wp);
    return post ? [post] : [];
  });

  return {
    props: {
      character,
      posts,
      locale: currentLocale,
    },
    revalidate: REVALIDATE_LOW,
  };
};
