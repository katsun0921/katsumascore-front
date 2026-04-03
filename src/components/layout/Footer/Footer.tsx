import React from 'react';
import { ListTaxonomy } from '@/components/ui/List/ListTaxonomy';
import { ListSocialIcon } from '@/components/ui/List/ListSocialIcon';
import type { TListTaxonomyProps } from '@/components/ui/List/ListTaxonomy';

export const Footer = ({}) => {
  const categories: TListTaxonomyProps = {
    label: 'CATEGORIES',
    lists: [
      {
        name: '映画',
        link: '#',
        count: 18,
      },
      {
        name: 'アニメ',
        link: '#',
        count: 8,
      },
      {
        name: 'ドラマ',
        link: '#',
        count: 1,
      },
    ],
  };
  return (
    <footer className='bg-[var(--color-footer)] px-0 py-10 pb-[60px] text-[var(--color-text-inverse)]'>
      <div className='relative mx-auto w-[90%] max-w-[1200px] p-0'>
        <section>
          <ListTaxonomy {...categories} />
        </section>
        <section className='mt-8 md:flex md:justify-between'>
          <ListSocialIcon />
          <div className='mt-8 ml-auto md:mt-0 md:flex md:flex-col'>
            <ul className='ml-auto flex gap-4'>
              <li>
                <a href=''>サイトについて</a>
              </li>
              <li>
                <a href=''>Privacy Policy</a>
              </li>
              <li>
                <a href=''>お問い合わせ</a>
              </li>
            </ul>
            <p className='mt-4 ml-auto'>
              All Rights Reserved. Developed by Katsumascore.
            </p>
          </div>
        </section>
      </div>
    </footer>
  );
};
