import Script from "next/script";

export type HomePageEmbedsProps = {
  facebookTimelineEmbedUrl?: string;
  extraScriptSrcs?: string[];
};

export const HomePageEmbeds = ({ facebookTimelineEmbedUrl, extraScriptSrcs }: HomePageEmbedsProps) => {
  const scripts = extraScriptSrcs?.filter(Boolean) ?? [];
  const hasAny = Boolean(facebookTimelineEmbedUrl) || scripts.length > 0;
  if (!hasAny) return null;

  return (
    <div className="homePageEmbeds">
      {facebookTimelineEmbedUrl ? (
        <div className="homePageEmbeds__facebook">
          <iframe
            title="Facebook Page"
            src={facebookTimelineEmbedUrl}
            className="homePageEmbeds__iframe"
            loading="lazy"
          />
        </div>
      ) : null}
      {scripts.map((src) => (
        <Script key={src} src={src} strategy="lazyOnload" />
      ))}
    </div>
  );
};
