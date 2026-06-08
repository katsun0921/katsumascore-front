import { TsutayaAd, GeoAd } from '@/components/ui-parts/Affiliate/A8net';
import type { AdRentalProps } from './AdRental.types';

export const AdRental = ({ heading }: AdRentalProps) => (
  <div className='mt-8'>
    <h2 className='mb-4 text-[var(--font-size-h3-sm)] font-[var(--font-weight-bold)] text-color-primary'>
      {heading}
    </h2>
    <ul className='m-0 flex list-none flex-col gap-4 p-0'>
      <li className='w-full'>
        <TsutayaAd />
      </li>
      <li className='w-full'>
        <GeoAd />
      </li>
    </ul>
  </div>
);
