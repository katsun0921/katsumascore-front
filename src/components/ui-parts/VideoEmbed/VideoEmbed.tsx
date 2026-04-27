export type VideoEmbedProps = {
  videoUrl?: string
  embedCode?: string
  title?: string
}

export const VideoEmbed = ({ videoUrl, embedCode, title }: VideoEmbedProps) => {
  if (!videoUrl && !embedCode) return null;

  return (
    <div className='w-full'>
      {videoUrl ? (
        <div className='relative aspect-video w-full overflow-hidden'>
          <iframe
            className='absolute inset-0 h-full w-full border-0'
            src={videoUrl}
            title={title ?? ''}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>
      ) : (
        <div className='relative aspect-video w-full overflow-hidden [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:border-0'>
          <div dangerouslySetInnerHTML={{ __html: embedCode! }} />
        </div>
      )}
    </div>
  );
};
