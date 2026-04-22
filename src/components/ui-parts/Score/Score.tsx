export type ScoreProps = {
  value: number
  max: number
}

export const Score = ({ value, max }: ScoreProps) => {
  const valueStr = Number.isInteger(value) ? String(value) : value.toFixed(1)
  const display = `${valueStr}/${max}`

  return (
    <div className='inline-flex items-center justify-center w-[88px] h-[88px] bg-[var(--color-score-accent)] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] [filter:drop-shadow(0_0_10px_var(--color-score-accent))]'>
      <div className='inline-flex items-center justify-center w-[80px] h-[80px] bg-[var(--color-score-bg)] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]'>
        <span className='[font-size:var(--font-size-h2-lg)] font-bold leading-none font-[var(--font-ui)] italic text-white'>
          {display}
        </span>
      </div>
    </div>
  )
}
