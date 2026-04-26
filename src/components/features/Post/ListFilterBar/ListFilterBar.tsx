import type { ListFilterBarProps } from './ListFilterBar.types';
export const ListFilterBar = ({ options, activeValue, onSelect, className }: ListFilterBarProps) => {
  return (
    <div className={['listFilterBar', className].filter(Boolean).join(' ')} role='toolbar' aria-label='絞り込み'>
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          className={[
            'listFilterBar__button',
            activeValue === option.value ? 'listFilterBar__button--active' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => onSelect(option.value)}
          aria-pressed={activeValue === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
