import type { VodPanelProps } from './VodPanel.types'

export const VodPanel = (props: VodPanelProps) => {
  if (props.variant === 'cinema') {
    return (
      <div className='mt-[var(--space-32)] flex items-center gap-[var(--space-12)] rounded-[6px] border-l-[4px] border-l-[var(--color-category)] bg-[var(--color-bg-muted)] px-[var(--space-16)] py-[var(--space-12)]'>
        <span className='shrink-0 rounded-[4px] bg-[var(--color-category)] px-[var(--space-12)] py-[var(--space-4)] text-[var(--font-size-caption-lg)] font-[var(--font-weight-bold)] text-[var(--color-text-inverse)]'>
          {props.badgeLabel}
        </span>
        <p className='m-0 text-[var(--font-size-ui-lg)] text-[var(--color-text-secondary)]'>{props.note}</p>
      </div>
    )
  }

  return (
    <div className='mt-[var(--space-32)]'>
      {props.heading && (
        <h2 className='mb-[var(--space-16)] text-[var(--font-size-h3-sm)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]'>
          {props.heading}
        </h2>
      )}
      <ul className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[var(--space-16)] p-0'>
        {props.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
