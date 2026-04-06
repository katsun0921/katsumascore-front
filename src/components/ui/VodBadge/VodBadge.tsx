const itemBase = 'inline-block px-3 py-1 rounded text-[var(--color-text-inverse)] text-[12px] font-bold'

const variantClasses = {
  netflix: `${itemBase} bg-[var(--color-netflix)]`,
  amazon: `${itemBase} bg-[var(--color-amazon)]`,
  unext: `${itemBase} border border-[var(--color-border-muted)] bg-[var(--color-unext)]`,
  cinema: `${itemBase} bg-[var(--color-category)]`,
}

interface VodBadgeProps {
  netflix?: boolean
  amazon?: boolean
  unext?: boolean
  isCinema?: boolean
}

export const VodBadge = ({ netflix, amazon, unext, isCinema }: VodBadgeProps) => {
  if (isCinema) {
    return (
      <div className='flex flex-wrap gap-2'>
        {/* eslint-disable-next-line katsumascore-ui/no-hardcoded-i18n */}
        <span className={variantClasses.cinema}>劇場公開中</span>
      </div>
    )
  }

  if (!netflix && !amazon && !unext) return null

  return (
    <div className='flex flex-wrap gap-2'>
      {netflix && <span className={variantClasses.netflix}>Netflix</span>}
      {amazon && <span className={variantClasses.amazon}>Amazon Prime</span>}
      {unext && <span className={variantClasses.unext}>U-NEXT</span>}
    </div>
  )
}
