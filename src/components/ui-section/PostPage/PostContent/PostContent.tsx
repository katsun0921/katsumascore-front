import type { PostContentData } from '@/types/post';
import { publicAssetUrl } from '@/libs/publicAssetUrl';
/** 本文HTML内の `/images/...` を Storybook サブパス配信でも解決できるようにする */
const rewritePublicImageSrc = (html: string): string => {
  return html.replace(/src="(\/images\/[^"]+)"/g, (_, path: string) => {
    return `src="${publicAssetUrl(path)}"`;
  });
};

/** h2/h3/h4 に id がなければ heading-{i} を採番して付与する（extractToc と同一ロジック） */
const injectHeadingIds = (html: string): string => {
  let i = 0;
  return html.replace(/<(h[234])([^>]*)>/g, (match, tag: string, attrs: string) => {
    if (/\bid=/.test(attrs)) {
      i++;
      return match;
    }
    const id = `heading-${i++}`;
    return `<${tag} id="${id}"${attrs}>`;
  });
};

export const PostContent = ({ content }: PostContentData) => {
  const html = injectHeadingIds(rewritePublicImageSrc(content));
  return (
    <div
      id='js-content'
      className='p-content'
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
