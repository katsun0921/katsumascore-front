/**
 * SSG 凍結ビルド専用の `next/image` 置き換え（`next.config.ts` の webpack alias で差し替える）。
 * WP 画像（`/wp-content/` を含む src）は描画せず、それ以外は本物の `next/image` に委ねる。
 * 全コンポーネントの画像を 1 か所で止めるための仕組みで、凍結ブランチ以外では使われない。
 */
import Image, { getImageProps } from 'next/dist/shared/lib/image-external';
import type { ImageProps } from 'next/image';
import { isWpImageUrl } from './hideWpImages';

const FreezeImage = ({ alt, ...props }: ImageProps) => (isWpImageUrl(props.src) ? null : <Image alt={alt} {...props} />);

export { getImageProps };
export default FreezeImage;
