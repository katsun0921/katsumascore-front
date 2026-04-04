import React from 'react';
import './ListSocialIcon.scss';
import {
  LinkFacebookIcon,
  LinkTwitterIcon,
  LinkRssIcon,
} from '@/components/ui/LinkSocialIcon/LinkSocialIcon';

export const ListSocialIcon = ({}) => {
  return (
    <ul className='list__socialLink'>
      <li>
        <LinkTwitterIcon />
      </li>
      <li>
        <LinkFacebookIcon />
      </li>
      <li>
        <LinkRssIcon />
      </li>
    </ul>
  );
};
