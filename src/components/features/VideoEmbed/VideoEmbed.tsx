import { VideoEmbed as VideoEmbedUI } from '@/components/ui/VideoEmbed/VideoEmbed'
import './VideoEmbed.scss'

export type TFeatureVideoEmbedProps = {
  embedCode: string
  locale?: 'ja' | 'en'
}

export const VideoEmbed = ({ embedCode }: TFeatureVideoEmbedProps) => {
  return (
    <div className='p-video-embed'>
      <VideoEmbedUI embedCode={embedCode} />
    </div>
  )
}
