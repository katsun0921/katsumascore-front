import type { ReactNode } from 'react';

export type PostCardMediaProps = {
  image: string | null;
  title: string;
  className?: string;
  sizes?: string;
  children?: ReactNode;
};
