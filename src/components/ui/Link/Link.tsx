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
    <a href='#' className='link__social link__facebook' target='_blank'>
      <span className='link__socialText'>Share on Facebook</span>
    </a>
  );
};

export const LinkTwitter = ({}) => {
  return (
    <a href='#' className='link__social link__twitter' target='_blank'>
      <span className='link__socialText'>Share on Twitter</span>
    </a>
  );
};
