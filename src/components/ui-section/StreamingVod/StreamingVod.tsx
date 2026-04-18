import type { StreamingVodProps } from './StreamingVod.types'

export const StreamingVod = ({ heading, items }: StreamingVodProps) => (
  <section className='mt-[var(--space-32)]'>
    <h2 className='mb-[var(--space-16)] text-[var(--font-size-h3-sm)] font-[var(--font-weight-bold)] leading-[1.5] text-[var(--color-text-primary)]'>
      {heading}
    </h2>
    <ul className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[var(--space-16)] p-0'>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </section>
)
