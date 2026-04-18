import { VideoEmbed } from '@/components/ui/VideoEmbed/VideoEmbed'
import { PostHeroSummary } from '@/components/ui-section/PostHeroSummary/PostHeroSummary'
import { useLayout } from '@/hooks/useLayout'

export type PostHeroProps = {
  titleJa: string

  trailerYoutubeId?: string
  trailerEmbedCode?: string

  posterUrl: string
  description: string
}

export const PostHero = (props: PostHeroProps) => {
  const layout = useLayout()
  const videoUrl = props.trailerYoutubeId
    ? `https://www.youtube.com/embed/${props.trailerYoutubeId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`
    : undefined

  return (
    <section className='flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:mt-6'>
      {(videoUrl || props.trailerEmbedCode) && (
        <VideoEmbed
          videoUrl={videoUrl}
          embedCode={props.trailerEmbedCode}
          title={props.titleJa}
        />
      )}
      <div className='lg:w-[30%]'>
          <PostHeroSummary posterUrl={props.posterUrl} text={props.description} direction={layout === 'sm' ? 'row' : 'column'} />
      </div>
    </section>
  )
}
