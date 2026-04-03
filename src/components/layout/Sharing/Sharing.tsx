import React from 'react';
import { LinkFacebook, LinkTwitter } from '@/components/ui/Link/Link';

export const Sharing = ({}) => {
  return (
    <ul className='relative flex w-full'>
      <li className='w-1/2 [clip-path:polygon(0_0,100%_0%,98%_100%,0%_100%)]'>
        <LinkTwitter />
      </li>
      <li className='w-1/2 [clip-path:polygon(2%_0,100%_0%,100%_100%,0%_100%)]'>
        <LinkFacebook />
      </li>
    </ul>
  );
};
