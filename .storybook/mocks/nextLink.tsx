import React from 'react';

type LinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
};

const Link = ({ href, className, children, ...props }: LinkProps) => (
  <a href={href} className={className} {...props}>
    {children}
  </a>
);

export default Link;
