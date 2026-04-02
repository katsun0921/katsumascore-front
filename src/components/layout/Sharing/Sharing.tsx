import React from 'react';
import { LinkFacebook, LinkTwitter } from '@/components/ui/Link/Link';

export const Sharing = ({}) => {
  return (
    <ul className='l-sharing'>
      <li className='l-sharing__block'>
        <LinkTwitter />
      </li>
      <li className='l-sharing__block'>
        <LinkFacebook />
      </li>
    </ul>
  );
};
