import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export const PostCardContainer = ({ children, className }: Props) => {
  const classes = [
    'w-full overflow-hidden rounded-[20px] bg-[var(--color-bg)] border border-[var(--color-border-soft)] shadow-[0_var(--space-16)_var(--space-32)_var(--color-border-soft)]',
    className,
  ].filter(Boolean).join(' ');
  return <article className={classes}>{children}</article>;
};
