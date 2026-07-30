export type TBadgeVariant = 'default' | 'primary' | 'cinema' | 'netflix' | 'amazon' | 'unext'

export type TBadgeProps = {
  label: string
  variant?: TBadgeVariant
}

const variantClasses: Record<TBadgeVariant, string> = {
  default: 'bg-color-bg-muted text-color-primary border border-color-border-muted',
  primary: 'bg-primary text-color-inverse',
  cinema: 'bg-category text-color-inverse',
  netflix: 'bg-netflix text-color-inverse',
  amazon: 'bg-amazon text-color-inverse',
  unext: 'bg-unext text-color-inverse border border-color-border-muted',
};

export const Badge = ({ label, variant = 'default' }: TBadgeProps) => {
  return (
    <span data-component='Badge' className={`inline-block rounded-[3px] px-3 py-1 text-[var(--font-size-caption-lg)] font-bold leading-[1.4] ${variantClasses[variant]}`}>
      {label}
    </span>
  );
};
