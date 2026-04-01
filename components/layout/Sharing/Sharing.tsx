import React from 'react';
import { LinkFacebook, LinkTwitter } from '../../components/Link/Link';
import '@/scss/layout/sharing.scss';

export const Sharing = ({}) => {
  return (
    <ul className='l-sharing'>
      <li className='l-sharing__block l-sharing__twitter'>
        <LinkTwitter />
      </li>
      <li className='l-sharing__block l-sharing__facebook'>
        <LinkFacebook />
      </li>
    </ul>
  );
};
