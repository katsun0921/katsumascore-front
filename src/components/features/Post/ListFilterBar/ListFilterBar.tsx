import Link from 'next/link';
import type { ListFilterBarProps } from './ListFilterBar.types';

export const ListFilterBar = ({ options, optionRows, activeValue, onSelect, className }: ListFilterBarProps) => {
  const rows = optionRows ?? [options];
  const activeValues = Array.isArray(activeValue) ? activeValue : [activeValue];

  return (
    <div data-component='ListFilterBar' className={['listFilterBar', className].filter(Boolean).join(' ')} role='group' aria-label='絞り込み'>
      {rows.map((row, rowIndex) => (
        <div className='listFilterBar__row' role='toolbar' aria-label='絞り込み' key={`row-${rowIndex}`}>
          {row.map((option) => {
            const classNameValue = [
              'listFilterBar__button',
              activeValues.includes(option.value) ? 'listFilterBar__button--active' : '',
            ].filter(Boolean).join(' ');

            if (option.href !== undefined) {
              return (
                <Link
                  key={option.value}
                  href={option.href}
                  locale={false}
                  className={classNameValue}
                  aria-current={activeValues.includes(option.value) ? 'true' : undefined}
                >
                  {option.label}
                </Link>
              );
            }

            return (
              <button
                key={option.value}
                type='button'
                className={classNameValue}
                onClick={() => onSelect?.(option.value)}
                aria-pressed={activeValues.includes(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
