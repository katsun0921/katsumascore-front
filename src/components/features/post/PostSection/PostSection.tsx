import type { ReactNode } from 'react';
import './PostSection.scss';

type Props = {
  title?: string;
  children: ReactNode;
};

export const PostSection = ({ title, children }: Props) => {
  return (
    <section className='postSection'>
      {title && <h2 className='postSection__title'>{title}</h2>}
      <div className='postSection__body'>{children}</div>
    </section>
  );
};
