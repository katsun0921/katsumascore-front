import React from 'react';

type CategoryProps = {
  label?: string;
  size?: 'small' | 'medium' | 'large';
};

export const Category = ({ label }: CategoryProps) => {
  return <div>{label}</div>;
};
