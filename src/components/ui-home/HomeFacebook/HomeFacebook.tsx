export type HomeFacebookProps = {
  title: string;
  embedUrl: string;
};

export const HomeFacebook = ({ title, embedUrl }: HomeFacebookProps) => {
  return (
    <section className='homeFacebook'>
      <h2 className='homeFacebook__title'>{title}</h2>
      <div className='homeFacebook__frame'>
        <iframe
          title='Facebook Page'
          src={embedUrl}
          className='homeFacebook__iframe'
          loading='lazy'
        />
      </div>
    </section>
  );
};
