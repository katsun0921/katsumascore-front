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

const Image = ({ src, alt, width, height, fill, className }: Props) => {
  if (fill) {
    return <img src={src} alt={alt} className={className} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />;
  }
  return <img src={src} alt={alt} width={width} height={height} className={className} />;
};

export default Image;
