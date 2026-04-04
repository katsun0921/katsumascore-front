import React from 'react';
import './ListTaxonomy.scss';

export type TListTaxonomyProps = {
  label: string;
  lists: TListProps[];
};

export type TListProps = {
  name: string;
  link: string;
  count: number;
};

export const ListTaxonomy = ({ label, lists }: TListTaxonomyProps) => {
  return (
    <dl className='list__taxonomy'>
      <dt className='list__term mb-4'>{label}</dt>
      <dd className='list__content'>
        <ul className='flex'>
          {lists.map((list, i) => {
            return (
              <li key={i} className='list__termList'>
                <a href={list.link}>
                  {list.name}
                  <span className='list__termCount'>{list.count}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </dd>
    </dl>
  );
};
