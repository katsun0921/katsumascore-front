import React from 'react';
import './Category.scss';

type CategoryProps = {
  label?: string;
  size?: 'small' | 'medium' | 'large';
};

export const Category = ({ label, size }: CategoryProps) => {
  const mode = size ? `category__${size}` : '';

  return <div className={['category', mode].filter(Boolean).join(' ')}>{label}</div>;
};
