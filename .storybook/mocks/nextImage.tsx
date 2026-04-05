import NextImage from 'next/image';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: unknown;
};

const Image = ({ src, alt, width = 500, height = 500, className }: Props) => {
  return <NextImage src={src} alt={alt} width={width} height={height} className={className} />;
};

export default Image;
