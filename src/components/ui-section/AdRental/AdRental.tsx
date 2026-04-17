import { TsutayaAd } from '@/components/ui/Affiliate/Tsutaya/TsutayaAd'
import { GeoAd } from '@/components/ui/Affiliate/Geo/GeoAd'
import type { AdRentalProps } from './AdRental.types'

export const AdRental = ({ heading }: AdRentalProps) => (
  <div className='mt-[var(--space-32)]'>
    <h2 className='mb-[var(--space-16)] text-[var(--font-size-h3-sp)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]'>
      {heading}
    </h2>
    <ul className='m-0 flex list-none flex-wrap justify-evenly gap-[var(--space-16)] p-0'>
      <li className='basis-1/3'>
        <TsutayaAd />
      </li>
      <li className='basis-1/3'>
        <GeoAd />
      </li>
    </ul>
  </div>
)
