import { VideoEmbed } from '@/components/ui/VideoEmbed/VideoEmbed'
import { PostHeroSummary } from '@/components/features/Post/PostHeroSummary/PostHeroSummary'
import { PostHeroScore } from '@/components/features/Post/PostHeroScore/PostHeroScore'
import './PostHero.scss'

export type PostHeroProps = {
  titleJa: string

  trailerYoutubeId?: string
  trailerEmbedCode?: string

  posterUrl: string
  description: string

  score: number
  scoreMax?: number
  authorComment: string
}

export function PostHero(props: PostHeroProps) {
  const videoUrl = props.trailerYoutubeId
    ? `https://www.youtube.com/embed/${props.trailerYoutubeId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`
    : undefined

  return (
    <section className='post-hero'>
      {(videoUrl || props.trailerEmbedCode) && (
        <VideoEmbed
          videoUrl={videoUrl}
          embedCode={props.trailerEmbedCode}
          title={props.titleJa}
        />
      )}
      <PostHeroSummary posterUrl={props.posterUrl} description={props.description} />
      <PostHeroScore
        score={props.score}
        scoreMax={props.scoreMax}
        comment={props.authorComment}
      />
    </section>
  )
}
