import type { ReactNode } from 'react';
import './PostCardContainer.scss';

type Props = {
  children: ReactNode;
  className?: string;
};

export const PostCardContainer = ({ children, className }: Props) => {
  const classes = ['postCardContainer', className].filter(Boolean).join(' ');
  return <article className={classes}>{children}</article>;
};
