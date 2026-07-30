import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  dataComponent?: string;
};

export const PostCardContainer = ({ children, className, dataComponent = 'PostCardContainer' }: Props) => {
  const classes = [
    'w-full overflow-hidden rounded-[20px] bg-color-bg border border-color-border-soft shadow-[0_var(--space-16)_var(--space-32)_var(--color-border-soft)]',
    className,
  ].filter(Boolean).join(' ');
  return <article data-component={dataComponent} className={classes}>{children}</article>;
};
