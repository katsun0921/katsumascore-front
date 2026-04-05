import './Score.scss'

export type ScoreProps = {
  value: number
  max?: number
}

export const Score = ({ value, max }: ScoreProps) => {
  const display = max != null ? `${value}/${max}` : value.toFixed(1)

  return (
    <div className='score'>
      <div className='score__bg'>
        <span className='score__value'>{display}</span>
      </div>
    </div>
  )
}
