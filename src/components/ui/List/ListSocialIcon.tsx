import React from 'react';
import {
  LinkFacebookIcon,
  LinkTwitterIcon,
  LinkRssIcon,
} from '../Link/LinkSocialIcon';

export const ListSocialIcon = ({}) => {
  return (
    <ul>
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
