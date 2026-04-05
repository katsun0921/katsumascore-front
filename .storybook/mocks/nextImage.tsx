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
    return `.${src}`
  }
  return src
}

const Image = ({ src, alt, width, height, fill, className }: Props) => {
  const resolvedSrc = normalizeImageSrc(src)
  if (fill) {
    return <img src={resolvedSrc} alt={alt} className={className} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />;
  }
  return <img src={resolvedSrc} alt={alt} width={width} height={height} className={className} />;
};

export default Image;
