import Image from 'next/image';
import Link from 'next/link';
import { VideoEmbed } from '@/components/ui-parts/VideoEmbed';
import type { PostTaxonomyLink } from '@/libs/api/wordpress';
import type { TStreamingVodEntry } from '@/components/features/StreamingVod';
import { VOD_CONFIG } from '@/config/vod.config';
import { t } from '@/i18n/t';
import { useLocale } from '@/i18n/provider';
import { messages } from './i18n';

export type PostHeroProps = {
  title: string
  trailerYoutubeId?: string
  trailerEmbedCode?: string
  posterUrl: string
  tagline?: string
  description: string
  refUrl?: string
  refLabel?: string
  genres?: PostTaxonomyLink[]
  tags?: PostTaxonomyLink[]
  streamingVods?: TStreamingVodEntry[]
}

export const PostHero = (props: PostHeroProps) => {
  const locale = useLocale();
  const prefixClassName = 'post-hero';
  const videoUrl = props.trailerYoutubeId
    ? `https://www.youtube.com/embed/${props.trailerYoutubeId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`
    : undefined;

  const hasGenres = Boolean(props.genres && props.genres.length > 0);
  const hasTags = Boolean(props.tags && props.tags.length > 0);
  const hasVods = Boolean(props.streamingVods && props.streamingVods.length > 0);
  const hasTaxonomies = hasGenres || hasTags || hasVods;

  return (
    <section className={prefixClassName}>
      {(videoUrl || props.trailerEmbedCode) && (
        <div className={`${prefixClassName}__trailer`}>
          <VideoEmbed
            videoUrl={videoUrl}
            embedCode={props.trailerEmbedCode}
            title={props.title}
          />
        </div>
      )}
        {hasTaxonomies && (
          <div className={`${prefixClassName}__taxonomies`}>
            {hasGenres && (
              <div className={`${prefixClassName}__taxonomy`}>
                <span className={`${prefixClassName}__taxonomy-label`}>
                  {t(messages, ['genre', 'label'], locale)}
                </span>
                <ul className={`${prefixClassName}__taxonomy-list`}>
                  {props.genres?.map((g) => (
                    <li key={g.slug} className={`${prefixClassName}__taxonomy-item`}>
                      <Link href={`/genre/${g.slug}`} className={`${prefixClassName}__taxonomy-link`}>
                        {g.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasTags && (
              <div className={`${prefixClassName}__taxonomy`}>
                <span className={`${prefixClassName}__taxonomy-label`}>
                  {t(messages, ['tag', 'label'], locale)}
                </span>
                <ul className={`${prefixClassName}__taxonomy-list`}>
                  {props.tags?.map((tag) => (
                    <li key={tag.slug} className={`${prefixClassName}__taxonomy-item`}>
                      <Link href={`/tag/${tag.slug}`} className={`${prefixClassName}__taxonomy-link`}>
                        {tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasVods && (
              <div className={`${prefixClassName}__taxonomy`}>
                <span className={`${prefixClassName}__taxonomy-label`}>
                  {t(messages, ['vod', 'label'], locale)}
                </span>
                <ul className={`${prefixClassName}__vod-list`}>
                  {props.streamingVods?.map((vod) => (
                    <li key={vod.service} className={`${prefixClassName}__vod-item`}>
                      <a
                        href={vod.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className={`${prefixClassName}__vod-badge`}
                        style={{ background: VOD_CONFIG[vod.service].colorVar }}
                      >
                        {VOD_CONFIG[vod.service].label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      <div className={`${prefixClassName}__summary`}>
        <h2 className={`${prefixClassName}__heading`}>{t(messages, ['heading'], locale)}</h2>
        <blockquote className={`${prefixClassName}__quote`}>
          <p className={`${prefixClassName}__quote-text`}>{props.description}</p>
          {(props.refUrl || props.refLabel) && (
            <cite className={`${prefixClassName}__cite`}>
              {props.refUrl ? (
                <a href={props.refUrl} target='_blank' rel='noopener noreferrer'>
                  {props.refLabel || props.refUrl}
                </a>
              ) : (
                props.refLabel
              )}
            </cite>
          )}
        </blockquote>
      </div>
      <div className={`${prefixClassName}__poster`}>
        {props.posterUrl ? (
          <Image
            src={props.posterUrl}
            alt=''
            fill
            sizes='(min-width: 768px) 30vw, 100vw'
            priority
            className={`${prefixClassName}__poster-img`}
          />
        ) : (
          <div className={`${prefixClassName}__poster-placeholder`} aria-hidden />
        )}
      </div>
    </section>
  );
};
