/**
 * SSG 凍結ビルド専用の `next/image` 置き換え（`next.config.ts` の webpack alias で差し替える）。
 * WP 画像（`/wp-content/` を含む src）はダミー画像に差し替えて描画し、レイアウトを保つ。
 * それ以外は本物の `next/image` に委ねる。全コンポーネントの画像を 1 か所で止めるための仕組みで、
 * 凍結ブランチ以外では使われない。
 */
import Image, { getImageProps } from 'next/dist/shared/lib/image-external';
import type { ImageProps } from 'next/image';
import { FREEZE_DUMMY_IMAGE, isWpImageUrl } from './hideWpImages';

const FreezeImage = ({ alt, ...props }: ImageProps) =>
  isWpImageUrl(props.src) ? (
    // blur プレースホルダは元画像用の blurDataURL を前提とするため、ダミー画像では使わない
    <Image {...props} alt={alt} src={FREEZE_DUMMY_IMAGE} placeholder='empty' unoptimized />
  ) : (
    <Image alt={alt} {...props} />
  );

export { getImageProps };
export default FreezeImage;
