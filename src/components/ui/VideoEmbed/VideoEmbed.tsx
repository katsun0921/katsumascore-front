import './VideoEmbed.scss'

export type VideoEmbedProps = {
  videoUrl?: string
  embedCode?: string
  title?: string
}

export const VideoEmbed = ({ videoUrl, embedCode, title }: VideoEmbedProps) => {
  if (!videoUrl && !embedCode) return null

  return (
    <div className='p-video-embed'>
      {videoUrl ? (
        <iframe
          src={videoUrl}
          title={title ?? ''}
          width='560'
          height='315'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: embedCode! }} />
      )}
    </div>
  )
}
