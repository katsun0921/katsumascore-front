import Image from 'next/image'
import { VideoEmbed } from '@/components/ui-parts/VideoEmbed'
import { t } from '@/i18n/t'
import { useLocale } from '@/i18n/provider'
import { messages } from './i18n'
import './PostHero.scss'

export type PostHeroProps = {
  title: string
  trailerYoutubeId?: string
  trailerEmbedCode?: string
  posterUrl: string
  description: string
  refUrl?: string
  refLabel?: string
}

export const PostHero = (props: PostHeroProps) => {
  const locale = useLocale()
  const prefixClassName = 'post-hero'
  const videoUrl = props.trailerYoutubeId
    ? `https://www.youtube.com/embed/${props.trailerYoutubeId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`
    : undefined

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
            sizes='(min-width: 768px) 140px, 100px'
            className={`${prefixClassName}__poster-img`}
          />
        ) : (
          <div className={`${prefixClassName}__poster-placeholder`} aria-hidden />
        )}
      </div>
    </section>
  )
}
