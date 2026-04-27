export type TBadgeVariant = 'default' | 'primary' | 'cinema' | 'netflix' | 'amazon' | 'unext'

export type TBadgeProps = {
  label: string
  variant?: TBadgeVariant
}

const variantClasses: Record<TBadgeVariant, string> = {
  default: 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]',
  primary: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]',
  cinema: 'bg-[var(--color-category)] text-[var(--color-text-inverse)]',
  netflix: 'bg-[var(--color-netflix)] text-[var(--color-text-inverse)]',
  amazon: 'bg-[var(--color-amazon)] text-[var(--color-text-inverse)]',
  unext: 'bg-[var(--color-unext)] text-[var(--color-text-inverse)] border border-[var(--color-border-muted)]',
};

export const Badge = ({ label, variant = 'default' }: TBadgeProps) => {
  return (
    <span className={`inline-block rounded-[3px] px-3 py-1 text-[var(--font-size-caption-lg)] font-bold leading-[1.4] ${variantClasses[variant]}`}>
      {label}
    </span>
  );
};
