import type { ReactNode } from 'react';

type TLinkSocialProps = {
  backgroundColor?: string;
  children: ReactNode;
};

export const LinkSocialIcon = ({ children, backgroundColor }: TLinkSocialProps) => {
  return <div style={{ backgroundColor }}>{children}</div>;
};

export const LinkFacebookIcon = ({}) => {
  return (
    <a
      href='https://www.facebook.com/people/Katsumascore/100072246676709/'
      target='_blank'
      className='relative block w-[50px] h-[50px] rounded-full bg-[rgba(var(--color-white-rgb),0.12)] hover:bg-[rgba(var(--color-white-rgb),0.2)] hover:opacity-100'
      rel='noreferrer'
    >
      <img
        src='https://katsumascore.blog/images/logo-facebook.png'
        alt='facebook'
        width={50}
        height={50}
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      />
    </a>
  );
};

export const LinkTwitterIcon = ({}) => {
  return (
    <a
      href='https://twitter.com/Katsun0921'
      target='_blank'
      className='relative block w-[50px] h-[50px] rounded-full bg-[rgba(var(--color-white-rgb),0.12)] hover:bg-[rgba(var(--color-white-rgb),0.2)] hover:opacity-100'
      rel='noreferrer'
    >
      <img
        src='https://katsumascore.blog/images/logo-twitter-blue-circle.png'
        alt='twitter'
        width={50}
        height={50}
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      />
    </a>
  );
};

export const LinkRssIcon = ({}) => {
  return (
    <a
      href='https://katsumascore.blog/feed/'
      target='_blank'
      className='relative block w-[50px] h-[50px] rounded-full bg-[var(--color-rss)] hover:bg-[rgba(var(--color-white-rgb),0.2)] hover:opacity-100'
      rel='noreferrer'
    >
      <img
        src='https://katsumascore.blog/images/logo-rss-white.png'
        alt='rss'
        width={30}
        height={30}
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      />
    </a>
  );
};
