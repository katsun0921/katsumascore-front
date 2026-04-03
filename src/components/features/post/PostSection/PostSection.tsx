import type { ReactNode } from 'react';
import './PostSection.scss';

type Props = {
  title?: string;
  children: ReactNode;
};

export const PostSection = ({ title, children }: Props) => {
  return (
    <section className='c-postSection'>
      {title && <h2 className='c-postSection__title'>{title}</h2>}
      <div className='c-postSection__body'>{children}</div>
    </section>
  );
};
