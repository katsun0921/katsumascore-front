import type { VodPanelProps } from './VodPanel.types';

export const VodPanel = (props: VodPanelProps) => {
  if (props.variant === 'cinema') {
    return (
      <div data-component='VodPanel' className='mt-8 flex items-center gap-3 rounded-[6px] border-l-[4px] border-l-category bg-color-bg-muted px-4 py-3'>
        <span className='shrink-0 rounded-[4px] bg-category px-3 py-1 text-[var(--font-size-caption-lg)] font-[var(--font-weight-bold)] text-color-inverse'>
          {props.badgeLabel}
        </span>
        <p className='m-0 text-ui text-color-secondary'>{props.note}</p>
      </div>
    );
  }

  return (
    <div data-component='VodPanel' className='mt-8'>
      {props.heading && (
        <h2 className='mb-4 text-[var(--font-size-h3-sm)] font-[var(--font-weight-bold)] text-color-primary'>
          {props.heading}
        </h2>
      )}
      <ul className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-0'>
        {props.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
