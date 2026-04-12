import type { PostContentData } from '@/components/features/Post/types/post';
import { publicAssetUrl } from '@/lib/publicAssetUrl';
import './PostContent.scss';

/** 本文HTML内の `/images/...` を Storybook サブパス配信でも解決できるようにする */
function rewritePublicImageSrc(html: string): string {
  return html.replace(/src="(\/images\/[^"]+)"/g, (_, path: string) => {
    return `src="${publicAssetUrl(path)}"`;
  });
}

export const PostContent = ({ content }: PostContentData) => {
  return (
    <div
      className='p-content'
      dangerouslySetInnerHTML={{ __html: rewritePublicImageSrc(content) }}
    />
  );
};
