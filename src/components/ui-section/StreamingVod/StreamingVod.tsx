import type { StreamingVodProps } from './StreamingVod.types';

export const StreamingVod = ({ heading, items }: StreamingVodProps) => (
  <section className='mt-8'>
    <h2 className='mb-4 text-[var(--font-size-h3-sm)] font-[var(--font-weight-bold)] leading-[1.5] text-color-primary'>
      {heading}
    </h2>
    <ul className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-0'>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </section>
);
