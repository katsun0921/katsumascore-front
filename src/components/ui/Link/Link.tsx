import React from 'react';
import type { ReactNode } from 'react';

type TLinkProps = {
  backgroundColor?: string;
  children: ReactNode;
};

export const Link = ({ children, backgroundColor }: TLinkProps) => {
  return <div style={{ backgroundColor }}>{children}</div>;
};

export const LinkFacebook = ({}) => {
  return (
    <a href='#' target='_blank'>
      <span>Share on Facebook</span>
    </a>
  );
};

export const LinkTwitter = ({}) => {
  return (
    <a href='#' target='_blank'>
      <span>Share on Twitter</span>
    </a>
  );
};
