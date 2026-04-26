import { TsutayaAd } from '@/components/ui-parts/Affiliate/Tsutaya'
import { GeoAd } from '@/components/ui-parts/Affiliate/Geo'
import type { AdRentalProps } from './AdRental.types'

export const AdRental = ({ heading }: AdRentalProps) => (
  <div className='mt-[var(--space-32)]'>
    <h2 className='mb-[var(--space-16)] text-[length:var(--font-size-h3-sm)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]'>
      {heading}
    </h2>
    <ul className='m-0 flex list-none flex-col gap-[var(--space-16)] p-0'>
      <li className='w-full'>
        <TsutayaAd />
      </li>
      <li className='w-full'>
        <GeoAd />
      </li>
    </ul>
  </div>
)
