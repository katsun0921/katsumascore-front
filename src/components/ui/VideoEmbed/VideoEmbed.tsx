import React from 'react'
import './VideoEmbed.scss'

export type TVideoEmbedProps = {
  embedCode?: string
  videoUrl?: string
  title?: string
}

export const VideoEmbed = ({ embedCode, videoUrl, title = 'Video' }: TVideoEmbedProps) => {
  if (!embedCode && !videoUrl) return null

  return (
    <div className='video-embed'>
      {embedCode ? (
        <div
          className='video-embed__iframe'
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      ) : (
        <iframe
          className='video-embed__iframe'
          src={videoUrl}
          title={title}
          allowFullScreen
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        />
      )}
    </div>
  )
}
