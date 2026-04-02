import React from 'react';

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
    <dl>
      <dt>{label}</dt>
      <dd>
        <ul>
          {lists.map((list, i) => {
            return (
              <li key={i}>
                <a href={list.link}>
                  {list.name}
                  <span>{list.count}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </dd>
    </dl>
  );
};
