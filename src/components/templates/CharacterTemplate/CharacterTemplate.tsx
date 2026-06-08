import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PostCardImgTop } from '@/components/ui-section/PostCard/PostCardImgTop';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { Character } from '@/types/character';
import type { Post } from '@/types/post';

type CharacterTemplateProps = {
  character: Character;
  posts: Post[];
  breadcrumbs: { label: string; href: string }[];
};

export const CharacterTemplate = ({ character, posts, breadcrumbs }: CharacterTemplateProps) => {
  const locale = useLocale();

  return (
    <PageLayout>
      <div className='mx-auto max-w-screen-lg px-4 py-6'>
        <Breadcrumb items={breadcrumbs} />
        <article className='mt-6'>
          <h1 className='text-2xl font-bold'>{character.name}</h1>
          {character.parentSlug && (
            <p className='mt-2 text-sm text-[var(--color-text-muted)]'>
              {t(messages, ['parent', 'label'], locale)}: {character.parentSlug}
            </p>
          )}
        </article>
        {posts.length > 0 && (
          <section className='mt-10'>
            <h2 className='mb-4 text-xl font-bold'>
              {t(messages, ['filmography', 'heading'], locale)}
            </h2>
            <ul className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCardImgTop post={post} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageLayout>
  );
};
