import Script from "next/script";

export type HomePageEmbedsProps = {
  extraScriptSrcs?: string[];
};

export const HomePageEmbeds = ({ extraScriptSrcs }: HomePageEmbedsProps) => {
  const scripts = extraScriptSrcs?.filter(Boolean) ?? [];
  if (scripts.length === 0) return null;

  return (
    <div className="homePageEmbeds">
      {scripts.map((src) => (
        <Script key={src} src={src} strategy="lazyOnload" />
      ))}
    </div>
  );
};
