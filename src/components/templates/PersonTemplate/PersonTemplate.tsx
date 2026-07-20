// ISR: revalidate 86400s (24h)
import Image from 'next/image';
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PostCardImgTop } from '@/components/ui-section/PostCard/PostCardImgTop';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { Person } from '@/libs/api/wordpress/transform';
import type { PersonRelatedPost } from '@/libs/api/wordpress';

type PersonTemplateProps = {
  person: Person;
  posts: PersonRelatedPost[];
  breadcrumbs: { label: string; href: string }[];
};

export const PersonTemplate = ({ person, posts, breadcrumbs }: PersonTemplateProps) => {
  const locale = useLocale();
  const displayName = locale === 'en'
    ? (person.nameEn || person.nameJa)
    : (person.nameJa || person.nameEn);
  const altName = locale === 'en' ? person.nameJa : person.nameEn;

  return (
    <PageLayout>
      <div className='mx-auto max-w-screen-lg px-4 py-6'>
        <Breadcrumb items={breadcrumbs} />
        <article className='mt-6'>
          <div className='flex flex-col gap-6 lg:flex-row'>
            {person.image && (
              <div className='shrink-0'>
                <Image
                  src={person.image.url}
                  alt={person.image.alt}
                  width={person.image.width || 240}
                  height={person.image.height || 320}
                  className='rounded-lg object-cover'
                />
              </div>
            )}
            <div className='flex flex-col gap-4'>
              <h1 className='text-2xl font-bold'>{displayName}</h1>
              {altName && <p className='text-sm text-[var(--color-text-muted)]'>{altName}</p>}
              {person.roles.length > 0 && (
                <ul className='flex gap-2'>
                  {person.roles.map((role) => (
                    <li
                      key={role}
                      className='rounded px-2 py-1 text-xs bg-[var(--color-surface-2)]'
                    >
                      {t(messages, ['role', role], locale)}
                    </li>
                  ))}
                </ul>
              )}
              {person.bio && <p className='leading-relaxed'>{person.bio}</p>}
            </div>
          </div>
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
                  {post.character && (
                    <p className='mt-1 text-sm text-[var(--color-text-muted)]'>
                      {t(messages, ['filmography', 'characterPrefix'], locale)}
                      {post.character}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageLayout>
  );
};
