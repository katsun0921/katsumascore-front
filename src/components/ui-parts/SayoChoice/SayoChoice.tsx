export type SayoChoiceProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

/** ノベル画面の選択肢（▶つき）。暗い背景の上で使う */
export const SayoChoice = ({ label, onClick, disabled = false, className }: SayoChoiceProps) => {
  const classes = [
    'flex-none whitespace-nowrap rounded-[8px] border px-4 py-1 text-[length:var(--font-size-fixed-14)] cursor-pointer',
    'border-[rgba(var(--color-white-rgb),0.18)] bg-[rgba(var(--color-black-rgb),0.6)] text-[color:var(--color-sayo-stage-text)]',
    'hover:border-[var(--color-sayo-amber)] hover:bg-[rgba(var(--color-sayo-amber-rgb),0.25)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sayo-amber)]',
    'disabled:cursor-default disabled:opacity-40',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type='button' data-component='SayoChoice' className={classes} onClick={onClick} disabled={disabled}>
      <span aria-hidden='true' className='mr-1 text-[length:var(--font-size-caption)] text-[color:var(--color-sayo-amber)]'>▶</span>
      {label}
    </button>
  );
};
