import React from 'react';
import './VodBadge.scss';

interface VodBadgeProps {
  netflix?: boolean;
  amazon?: boolean;
  unext?: boolean;
  isCinema?: boolean;
}

export const VodBadge = ({ netflix, amazon, unext, isCinema }: VodBadgeProps) => {
  if (isCinema) {
    return (
      <div className='vod-badge'>
        <span className='vod-badge__item vod-badge__item--cinema'>劇場公開中</span>
      </div>
    );
  }

  if (!netflix && !amazon && !unext) {
    return null;
  }

  return (
    <div className='vod-badge'>
      {netflix && <span className='vod-badge__item vod-badge__item--netflix'>Netflix</span>}
      {amazon && <span className='vod-badge__item vod-badge__item--amazon'>Amazon Prime</span>}
      {unext && <span className='vod-badge__item vod-badge__item--unext'>U-NEXT</span>}
    </div>
  );
};
