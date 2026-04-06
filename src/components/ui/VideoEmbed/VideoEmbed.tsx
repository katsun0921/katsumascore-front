export type TVideoEmbedProps = {
  embedCode?: string
  videoUrl?: string
  title?: string
}

export const VideoEmbed = ({ embedCode, videoUrl, title = 'Video' }: TVideoEmbedProps) => {
  if (!embedCode && !videoUrl) return null

  return (
    <div className='relative w-full mt-4 pt-[56.25%]'>
      {embedCode ? (
        <div
          className='absolute inset-0 w-full h-full border-none'
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      ) : (
        <iframe
          className='absolute inset-0 w-full h-full border-none'
          src={videoUrl}
          title={title}
          allowFullScreen
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        />
      )}
    </div>
  )
}
