import Image from 'next/image';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostCardImgTop } from '@/components/ui-section/PostCard/PostCardImgTop';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { getEntityUrl } from '@/libs/route';
import { messages } from './i18n';
import type { PersonTemplateProps } from './PersonTemplate.types';

export const PersonTemplate = ({ person, castPosts, directorPosts }: PersonTemplateProps) => {
  const locale = useLocale();

  const breadcrumbItems = [
    { label: t(messages, ['breadcrumb', 'home'], locale), href: '/' },
    { label: t(messages, ['breadcrumb', 'person'], locale), href: getEntityUrl('person', '', locale).replace(/\/$/, '') },
    { label: person.name },
  ];

  const roleLabels = person.roles.map((role) =>
    t(messages, ['roles', role], locale),
  );

  return (
    <PageLayout>
      {/* Hero */}
      <div className='bg-secondary'>
        <div className='px-4 pt-3 pb-0'>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <section className='px-4 py-8 md:py-12'>
          <div className='flex gap-6 items-start'>
            {person.image && (
              <div className='shrink-0'>
                <Image
                  src={person.image}
                  alt={person.name}
                  width={80}
                  height={80}
                  className='rounded-full object-cover'
                />
              </div>
            )}
            <div className='space-y-2'>
              <div className='flex flex-wrap gap-2'>
                {roleLabels.map((label) => (
                  <span
                    key={label}
                    className='text-xs tracking-[0.15em] text-score-accent uppercase font-ui'
                  >
                    {label}
                  </span>
                ))}
              </div>
              <h1 className='font-bold text-color-inverse'>{person.name}</h1>
            </div>
          </div>
        </section>
      </div>

      <div className='px-4 py-8 space-y-12'>
        {/* Bio */}
        {person.bio && (
          <section>
            <h2 className='text-sm font-bold text-color-primary mb-3'>
              {t(messages, ['section', 'bio'], locale)}
            </h2>
            <p className='text-sm text-color-secondary leading-relaxed whitespace-pre-wrap'>
              {person.bio}
            </p>
          </section>
        )}

        {/* Cast appearances */}
        {person.roles.includes('actor') && (
          <section>
            <h2 className='text-sm font-bold text-color-primary mb-4'>
              {t(messages, ['section', 'cast'], locale)}
            </h2>
            {castPosts.length > 0 ? (
              <ol className='m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4 lg:gap-4'>
                {castPosts.map((post) => (
                  <li key={post.id}>
                    <PostCardImgTop post={post} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className='text-sm text-color-secondary'>
                {t(messages, ['empty', 'posts'], locale)}
              </p>
            )}
          </section>
        )}

        {/* Director works */}
        {person.roles.includes('director') && (
          <section>
            <h2 className='text-sm font-bold text-color-primary mb-4'>
              {t(messages, ['section', 'director'], locale)}
            </h2>
            {directorPosts.length > 0 ? (
              <ol className='m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4 lg:gap-4'>
                {directorPosts.map((post) => (
                  <li key={post.id}>
                    <PostCardImgTop post={post} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className='text-sm text-color-secondary'>
                {t(messages, ['empty', 'posts'], locale)}
              </p>
            )}
          </section>
        )}
      </div>
    </PageLayout>
  );
};
