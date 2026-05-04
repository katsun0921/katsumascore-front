import type { ReactNode } from 'react';

export type VodPanelVariant = 'cinema' | 'list'

export type VodPanelProps =
  | {
      variant: 'cinema'
      badgeLabel: string
      note: string
    }
  | {
      variant: 'list'
      heading?: string
      items: ReactNode[]
    }
