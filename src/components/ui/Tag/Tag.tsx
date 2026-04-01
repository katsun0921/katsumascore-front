import React from 'react';

export type TTagsProps = {
  tags: {
    label: string;
  }[];
};

export const Tags = ({ tags }: TTagsProps) => {
  return (
    <div className='c-tags'>
      {tags.map((tag, _i) => {
        const { label } = tag;
        return <a key={_i} href='#'>{label}</a>;
      })}
    </div>
  );
};
