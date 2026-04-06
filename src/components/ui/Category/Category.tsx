type CategoryProps = {
  label?: string
  size?: 'small' | 'medium' | 'large'
}

const sizeClasses: Partial<Record<NonNullable<CategoryProps['size']>, string>> = {
  small: 'py-[9px] px-[20px] text-[0.75rem] leading-[0.75rem]',
}

export const Category = ({ label, size }: CategoryProps) => {
  const base = 'inline-block py-[9px] px-[22px] [transform:skewX(-8deg)] bg-[var(--color-category)] text-[var(--color-text-inverse)] text-[0.875rem] font-medium text-center'
  const extra = size ? (sizeClasses[size] ?? '') : ''

  return <div className={[base, extra].filter(Boolean).join(' ')}>{label}</div>
}
