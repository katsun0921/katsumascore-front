'use client';

import Link from 'next/link';
import { OfficialSns } from '@/components/features/OfficialSns';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
export type TStudioEntry = {
  name: string
  href?: string
}

export type TCreditEntry = {
  role: string
  names: string[]
}

export type TActor = {
  character?: string
  actorName?: string
  actorUrl?: string
  description?: string
  otherWorks?: { title: string; href: string; character?: string; score?: number }[]
}

/** ACF 公式SNS1件（リンク / X・TikTok 等の埋め込みHTML） */
export type TOfficialSnsEntry = {
  link?: string
  /** X: twitter-tweet / Instagram: instagram-media / TikTok: tiktok-embed 等（&lt;script&gt; は正規化時に除去） */
  embedHtml?: string
}

export type TTitleMetaProps = {
  officialUrl?: string
  copyright?: string
  releaseDate?: string
  officialSns?: Record<string, TOfficialSnsEntry>
  filmStudios?: TStudioEntry[]
  productionStudios?: TStudioEntry[]
  credits?: TCreditEntry[]
  actors?: TActor[]
}

export const TitleMeta = ({
  officialUrl,
  copyright,
  releaseDate,
  officialSns,
  credits,
  actors,
}: TTitleMetaProps) => {
  const locale = useLocale();
  let parsedDate: string | null = null;
  if (releaseDate && releaseDate.length === 8) {
    const y = releaseDate.slice(0, 4);
    const m = releaseDate.slice(4, 6);
    const d = releaseDate.slice(6, 8);
    parsedDate =
      locale === 'en'
        ? new Date(`${y}-${m}-${d}`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : `${y}${t(messages, ['date', 'yearSuffix'], locale)}${parseInt(m)}${t(messages, ['date', 'monthSuffix'], locale)}${parseInt(d)}${t(messages, ['date', 'daySuffix'], locale)}`;
  }

  /** 埋め込みウィジェット対応プラットフォーム（twitter 等は build で x に正規化済み） */
  const hasEmbeddableOfficialSns = Boolean(
    officialSns?.x?.link ||
      officialSns?.x?.embedHtml ||
      officialSns?.youtube_channel?.link ||
      officialSns?.instagram?.link ||
      officialSns?.instagram?.embedHtml ||
      officialSns?.tiktok?.link ||
      officialSns?.tiktok?.embedHtml,
  );
  const hasCredits = credits && credits.length > 0;
  const hasActors = actors && actors.length > 0;
  const hasOfficialInfo = officialUrl || hasEmbeddableOfficialSns || parsedDate;

  return (
    <div className='flex flex-col gap-6'>
      {(hasCredits || hasActors) && (
        <div className='rounded-lg border border-color-border-muted bg-[rgba(var(--color-secondary-rgb),0.05)] p-6'>
          <div className='mb-6 flex items-center gap-2'>
            <span className='font-ui whitespace-nowrap text-ui font-bold tracking-[0.2em] text-accent uppercase'>
              {t(messages, ['section', 'creditsAndCast'], locale)}
            </span>
            <div className='h-px grow bg-[linear-gradient(90deg,var(--color-accent),transparent)]' />
          </div>

          <div className='flex flex-col gap-6'>
            {hasCredits && credits.map((entry, i) => (
              <div key={`credit-${i}`} className='border-l-2 border-accent pl-4'>
                <span className='font-ui mb-1 flex gap-[0.3em] text-ui font-bold tracking-[0.1em] text-color-secondary uppercase'>
                  {entry.role}
                </span>
                <div className='text-h3 font-bold leading-[1.4] text-color-primary'>{entry.names.join(' / ')}</div>
              </div>
            ))}

            {hasActors && actors.map((actor, i) => (
              <div key={`actor-${i}`} className='border-l-2 border-accent pl-4'>
                {actor.character && (
                  <div className='font-ui mb-1 flex gap-[0.3em] text-ui font-bold tracking-[0.1em] text-color-secondary uppercase'>
                    <span>{actor.character}</span>
                    <span>{t(messages, ['actor', 'labelRole'], locale)}</span>
                  </div>
                )}
                {actor.actorName && (
                  <div className='text-h3 font-bold leading-[1.4] text-color-primary'>
                    {actor.actorUrl ? (
                      <Link href={actor.actorUrl} className='text-inherit no-underline hover:underline'>
                        {actor.actorName}
                      </Link>
                    ) : (
                      actor.actorName
                    )}
                  </div>
                )}
                {actor.description && (
                  <p className='mt-2 text-color-secondary leading-[1.6]'>{actor.description}</p>
                )}
                {actor.otherWorks && actor.otherWorks.length > 0 && (
                  <div className='flex gap-2 overflow-x-auto pt-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    {actor.otherWorks.map((work, j) => (
                      <Link
                        key={j}
                        href={work.href}
                        className='block basis-[120px] shrink-0 rounded-[12px] border border-color-border-muted bg-[rgba(var(--color-secondary-rgb),0.04)] px-3 py-2 no-underline transition-[border-color,background] duration-200 ease-in-out hover:border-accent hover:bg-[rgba(var(--color-secondary-rgb),0.08)]'
                      >
                        <span className='block overflow-hidden text-ui font-bold leading-[1.3] text-color-primary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]'>{work.title}</span>
                        {work.score !== undefined && (
                          <span className='font-ui mt-1 block text-ui font-bold text-accent'>{work.score}</span>
                        )}
                        {work.character && (
                          <span className='mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-ui text-color-secondary'>{work.character}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasOfficialInfo && (
        <div className='rounded-lg border border-color-border-muted bg-[rgba(var(--color-secondary-rgb),0.05)] p-6'>
          <div className='mb-6 flex items-center gap-2'>
            <span className='font-ui whitespace-nowrap text-ui font-bold tracking-[0.2em] text-accent uppercase'>
              {t(messages, ['section', 'officialInfo'], locale)}
            </span>
            <div className='h-px grow bg-[linear-gradient(90deg,var(--color-accent),transparent)]' />
          </div>

          {officialUrl && (
            <div className='mb-5 last:mb-0'>
              <div className='mb-2 text-ui font-bold tracking-[0.05em] text-color-secondary'>
                {t(messages, ['terms', 'officialSite'], locale)}
              </div>
              <a
                href={officialUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block rounded-lg border border-accent px-4 py-2 text-ui font-bold text-accent no-underline transition-colors duration-200 ease-in-out hover:bg-[rgba(var(--color-secondary-rgb),0.08)]'
              >
                {t(messages, ['terms', 'visitSite'], locale)}
              </a>
              {copyright && <p className='mt-2 text-caption text-color-secondary'>{copyright}</p>}
            </div>
          )}

          {hasEmbeddableOfficialSns && (
            <div className='mb-5 last:mb-0'>
              <div className='mb-2 text-ui font-bold tracking-[0.05em] text-color-secondary'>
                {t(messages, ['terms', 'officialSns'], locale)}
              </div>
              <OfficialSns
                snsUrl={officialSns?.x?.link}
                xEmbedHtml={officialSns?.x?.embedHtml}
                youtubeUrl={officialSns?.youtube_channel?.link}
                instagramUrl={officialSns?.instagram?.link}
                instagramEmbedHtml={officialSns?.instagram?.embedHtml}
                tiktokUrl={officialSns?.tiktok?.link}
                tiktokEmbedHtml={officialSns?.tiktok?.embedHtml}
                forceVisible
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
