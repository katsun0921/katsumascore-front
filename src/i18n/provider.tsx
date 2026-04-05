/**
 * I18nProvider — provides locale context to the component tree.
 *
 * Usage (app root or Storybook decorator):
 *   <I18nProvider locale="ja">
 *     <App />
 *   </I18nProvider>
 *
 * Components consume locale via useLocale().
 */

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Locale } from './t'

const I18nContext = createContext<Locale>('ja')

type Props = {
  locale: Locale
  children: ReactNode
}

export const I18nProvider = ({ locale, children }: Props) => (
  <I18nContext.Provider value={locale}>{children}</I18nContext.Provider>
)

export const useLocale = (): Locale => useContext(I18nContext)
