const BASE_PATH = (import.meta.env?.STORYBOOK_BASE_PATH ?? '/').replace(/\/$/, '')
const publicAssetUrl = (src: string): string => `${BASE_PATH}${src}`

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  [key: string]: unknown;
};

const normalizeImageSrc = (src: string): string => {
  if (src.startsWith('/') && !src.startsWith('//')) {
    return publicAssetUrl(src)
  }
  return src
}

const Image = ({ src, alt, width, height, fill, className }: Props) => {
  const resolvedSrc = normalizeImageSrc(src)
  if (fill) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={resolvedSrc} alt={alt} className={className} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={resolvedSrc} alt={alt} width={width} height={height} className={className} />;
};

export default Image;
