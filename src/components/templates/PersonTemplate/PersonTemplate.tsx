// ISR: revalidate 86400s (24h)
import Image from 'next/image';
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PostCardImgTop } from '@/components/ui-section/PostCard/PostCardImgTop';
import { PostCardListHorizontal } from '@/components/ui-section/PostCard';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { Person } from '@/libs/api/wordpress/transform';
import type { PersonRelatedPost } from '@/libs/api/wordpress';

type PersonTemplateProps = {
  person: Person;
  posts: PersonRelatedPost[];
  notableWorks: PersonRelatedPost[];
  recommendedWorks: PersonRelatedPost[];
  breadcrumbs: { label: string; href: string }[];
};

/** AI生成の長文セクション（編集部解説・人物の魅力・キャリア・作風等）。空文字なら描画しない。 */
const AiTextSection = ({ heading, text }: { heading: string; text: string }) => {
  if (!text) return null;
  return (
    <section className='mt-10'>
      <h2 className='mb-4 text-xl font-bold'>{heading}</h2>
      <p className='whitespace-pre-line leading-relaxed'>{text}</p>
    </section>
  );
};

export const PersonTemplate = ({
  person,
  posts,
  notableWorks,
  recommendedWorks,
  breadcrumbs,
}: PersonTemplateProps) => {
  const locale = useLocale();
  const displayName = locale === 'en'
    ? (person.nameEn || person.nameJa)
    : (person.nameJa || person.nameEn);
  const altName = locale === 'en' ? person.nameJa : person.nameEn;

  const infoRows = [
    { key: 'birthDate', value: person.birthDate },
    { key: 'deathDate', value: person.deathDate },
    { key: 'birthplace', value: person.birthplace },
    { key: 'nationality', value: person.nationality },
    { key: 'activeYears', value: person.activeYears },
    { key: 'gender', value: person.gender ? t(messages, ['gender', person.gender], locale) : '' },
  ].filter((row) => row.value !== '');
  const hasBasicInfo = infoRows.length > 0 || !!person.officialUrl || person.officialSns.length > 0;

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

          {hasBasicInfo && (
            <section className='mt-10'>
              <h2 className='mb-4 text-xl font-bold'>
                {t(messages, ['basicInfo', 'heading'], locale)}
              </h2>
              <dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg p-4 text-sm bg-[var(--color-surface-2)]'>
                {infoRows.map((row) => (
                  <div key={row.key} className='col-span-2 grid grid-cols-subgrid'>
                    <dt className='font-bold'>{t(messages, ['basicInfo', row.key], locale)}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
                {person.officialUrl && (
                  <div className='col-span-2 grid grid-cols-subgrid'>
                    <dt className='font-bold'>{t(messages, ['basicInfo', 'officialUrl'], locale)}</dt>
                    <dd>
                      <a
                        href={person.officialUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='underline text-[var(--color-primary)]'
                      >
                        {person.officialUrl}
                      </a>
                    </dd>
                  </div>
                )}
                {person.officialSns.length > 0 && (
                  <div className='col-span-2 grid grid-cols-subgrid'>
                    <dt className='font-bold'>{t(messages, ['basicInfo', 'sns'], locale)}</dt>
                    <dd className='flex flex-wrap gap-3'>
                      {person.officialSns.map((sns) => (
                        <a
                          key={sns.url}
                          href={sns.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='underline text-[var(--color-primary)]'
                        >
                          {t(messages, ['sns', sns.platform], locale)}
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* 編集部解説: Wikipedia的な客観記述ではなく、編集部視点で人物の魅力を伝えるセクション */}
          <AiTextSection
            heading={t(messages, ['summary', 'heading'], locale)}
            text={person.aiSummary}
          />
          {/* 人物の魅力: Wikipediaでは得られない独自コンテンツ */}
          <AiTextSection
            heading={t(messages, ['strength', 'heading'], locale)}
            text={person.aiStrength}
          />
          <AiTextSection
            heading={t(messages, ['career', 'heading'], locale)}
            text={person.aiCareer}
          />
          <AiTextSection
            heading={t(messages, ['style', 'heading'], locale)}
            text={person.aiStyle}
          />
          <AiTextSection
            heading={t(messages, ['style', 'theme'], locale)}
            text={person.aiTheme}
          />
          <AiTextSection
            heading={t(messages, ['style', 'position'], locale)}
            text={person.aiPosition}
          />

          {notableWorks.length > 0 && (
            <section className='mt-10'>
              <h2 className='mb-4 text-xl font-bold'>
                {t(messages, ['notableWorks', 'heading'], locale)}
              </h2>
              <ul className='grid grid-cols-2 gap-3 lg:grid-cols-3'>
                {notableWorks.map((post) => (
                  <li key={post.id}>
                    <PostCardImgTop
                      post={post}
                      caption={
                        post.character
                          ? `${t(messages, ['filmography', 'characterPrefix'], locale)}${post.character}`
                          : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
              {person.aiNotableReason && (
                <p className='mt-4 whitespace-pre-line leading-relaxed'>
                  {person.aiNotableReason}
                </p>
              )}
            </section>
          )}

          {/* おすすめ作品: 代表作品と同じレビュースコア上位データを、初見の読者向けにランキング形式で提示する */}
          {recommendedWorks.length > 0 && (
            <section className='mt-10'>
              <h2 className='mb-4 text-xl font-bold'>
                {t(messages, ['recommendedWorks', 'heading'], locale)}
              </h2>
              <PostCardListHorizontal posts={recommendedWorks} postCardKind='imgLeft' rank={1} />
            </section>
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
                  <PostCardImgTop
                    post={post}
                    caption={
                      post.character
                        ? `${t(messages, ['filmography', 'characterPrefix'], locale)}${post.character}`
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {person.faq.length > 0 && (
          <section className='mt-10'>
            <h2 className='mb-4 text-xl font-bold'>
              {t(messages, ['faq', 'heading'], locale)}
            </h2>
            <dl className='flex flex-col gap-4'>
              {person.faq.map((item) => (
                <div key={item.question} className='rounded-lg p-4 bg-[var(--color-surface-2)]'>
                  <dt className='mb-2 font-bold'>{item.question}</dt>
                  <dd className='leading-relaxed'>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </PageLayout>
  );
};
