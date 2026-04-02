import React from 'react';

interface VodBadgeProps {
  netflix?: boolean;
  amazon?: boolean;
  unext?: boolean;
  isCinema?: boolean;
}

export const VodBadge = ({ netflix, amazon, unext, isCinema }: VodBadgeProps) => {
  if (isCinema) {
    return (
      <div>
        <span>劇場公開中</span>
      </div>
    );
  }

  if (!netflix && !amazon && !unext) {
    return null;
  }

  return (
    <div>
      {netflix && <span>Netflix</span>}
      {amazon && <span>Amazon Prime</span>}
      {unext && <span>U-NEXT</span>}
    </div>
  );
};
