// ISR: revalidate 86400s (24h)
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PostCardImgTop } from '@/components/ui-section/PostCard/PostCardImgTop';
import { PostCardListHorizontal } from '@/components/ui-section/PostCard';
import { PersonAvatar, resolvePersonAvatarVariant } from '@/components/ui-parts/PersonAvatar';
import type { TPersonAvatarVariant } from '@/components/ui-parts/PersonAvatar';
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

/** PersonAvatarの画像バリアント優先度と表示ロールラベルを一致させるためのMap（俳優と女優は"俳優"に統一）。 */
const avatarVariantToRoleKey: Record<TPersonAvatarVariant, 'actor' | 'director' | 'voice_actor'> = {
  actor: 'actor',
  actress: 'actor',
  director: 'director',
  voiceActor: 'voice_actor',
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
  /** ロケールに応じた版を選ぶ。手動翻訳が未入力の場合は空文字を返す（日本語へのフォールバックはしない） */
  const pick = (ja: string, en: string) => (locale === 'en' ? en : ja);
  /** 手動翻訳が未入力の賞（awardName が空）は表示しない */
  const displayAwards = person.awards
    .map((award) => ({
      ...award,
      displayName: pick(award.awardName, award.awardNameEn),
      displayWorkTitle: pick(award.workTitle, award.workTitleEn),
    }))
    .filter((award) => !!award.displayName);
  /** 手動翻訳が未入力のFAQ（question/answerが空）は表示しない */
  const displayFaq = person.faq
    .map((item) => ({
      displayQuestion: pick(item.question, item.questionEn),
      displayAnswer: pick(item.answer, item.answerEn),
    }))
    .filter((item) => !!item.displayQuestion && !!item.displayAnswer);

  const infoRows = [
    { key: 'birthDate', value: person.birthDate },
    { key: 'deathDate', value: person.deathDate },
    { key: 'nationality', value: person.nationality.join('、') },
    { key: 'activeYears', value: person.activeYears },
    { key: 'gender', value: person.gender ? t(messages, ['gender', person.gender], locale) : '' },
  ].filter((row) => row.value !== '');
  const hasBasicInfo = infoRows.length > 0 || !!person.officialUrl || person.officialSns.length > 0;
  const avatarVariant = resolvePersonAvatarVariant(person.roles);
  const roleLabel = t(messages, ['role', avatarVariantToRoleKey[avatarVariant]], locale);

  return (
    <PageLayout>
      <div className='mx-auto max-w-screen-lg px-4 py-6'>
        <Breadcrumb items={breadcrumbs} />
        <article className='mt-6'>
          <div className='flex flex-col gap-1'>
            {person.roles.length > 0 && (
              <p className='text-xs text-[var(--color-text-muted)]'>{roleLabel}</p>
            )}
            <h1 className='text-2xl font-bold'>{displayName}</h1>
            {altName && <p className='text-sm text-[var(--color-text-muted)]'>{altName}</p>}
          </div>

          <div className={`mt-6 grid grid-cols-1 gap-6 ${hasBasicInfo ? 'lg:grid-cols-[max-content_1fr]' : ''}`}>
            <PersonAvatar
              roles={person.roles}
              name={displayName}
              className='h-[320px] w-[240px] rounded-lg bg-[var(--color-surface-2)] p-8'
            />

            {hasBasicInfo && (
              <section>
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
          </div>

          {/* 編集部解説: Wikipedia的な客観記述ではなく、編集部視点で人物の魅力を伝えるセクション */}
          <AiTextSection
            heading={t(messages, ['summary', 'heading'], locale)}
            text={pick(person.aiSummary, person.aiSummaryEn)}
          />
          {/* 人物の魅力: Wikipediaでは得られない独自コンテンツ */}
          <AiTextSection
            heading={t(messages, ['strength', 'heading'], locale)}
            text={pick(person.aiStrength, person.aiStrengthEn)}
          />
          <AiTextSection
            heading={t(messages, ['career', 'heading'], locale)}
            text={pick(person.aiCareer, person.aiCareerEn)}
          />
          <AiTextSection
            heading={t(messages, ['style', 'heading'], locale)}
            text={pick(person.aiStyle, person.aiStyleEn)}
          />
          <AiTextSection
            heading={t(messages, ['style', 'theme'], locale)}
            text={pick(person.aiTheme, person.aiThemeEn)}
          />
          <AiTextSection
            heading={t(messages, ['style', 'position'], locale)}
            text={pick(person.aiPosition, person.aiPositionEn)}
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
              {pick(person.aiNotableReason, person.aiNotableReasonEn) && (
                <p className='mt-4 whitespace-pre-line leading-relaxed'>
                  {pick(person.aiNotableReason, person.aiNotableReasonEn)}
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

        {displayAwards.length > 0 && (
          <section className='mt-10'>
            <h2 className='mb-4 text-xl font-bold'>
              {t(messages, ['awards', 'heading'], locale)}
            </h2>
            <ul className='flex flex-col gap-3'>
              {displayAwards.map((award) => (
                <li
                  key={`${award.year}-${award.awardName}-${award.workTitle}`}
                  className='flex flex-wrap items-baseline gap-2 rounded-lg p-4 bg-[var(--color-surface-2)]'
                >
                  {award.year && <span className='font-bold'>{award.year}</span>}
                  <span>{award.displayName}</span>
                  {award.displayWorkTitle && (
                    <span className='text-[var(--color-text-muted)]'>{`『${award.displayWorkTitle}』`}</span>
                  )}
                  {award.result && (
                    <span className='rounded px-2 py-0.5 text-xs bg-[var(--color-primary)] text-[var(--color-text-inverse)]'>
                      {t(messages, ['awards', award.result], locale)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {displayFaq.length > 0 && (
          <section className='mt-10'>
            <h2 className='mb-4 text-xl font-bold'>
              {t(messages, ['faq', 'heading'], locale)}
            </h2>
            <dl className='flex flex-col gap-4'>
              {displayFaq.map((item) => (
                <div key={item.displayQuestion} className='rounded-lg p-4 bg-[var(--color-surface-2)]'>
                  <dt className='mb-2 font-bold'>{item.displayQuestion}</dt>
                  <dd className='leading-relaxed'>{item.displayAnswer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </PageLayout>
  );
};
