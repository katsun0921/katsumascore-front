type CategoryProps = {
  label?: string
  size?: 'small' | 'medium' | 'large'
}

const sizeClasses: Partial<Record<NonNullable<CategoryProps['size']>, string>> = {
  small: 'px-5 py-2 text-[var(--font-size-caption-lg)] leading-[var(--font-size-caption-lg)]',
};

export const Category = ({ label, size }: CategoryProps) => {
  const base = 'inline-block px-5 py-2 [transform:skewX(-8deg)] bg-category text-white text-[var(--font-size-ui-lg)] font-medium text-center';
  const extra = size ? (sizeClasses[size] ?? '') : '';

  return <div className={[base, extra].filter(Boolean).join(' ')}>{label}</div>;
};
