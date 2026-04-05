import '@/styles/globals.css'
import { createElement } from 'react'
import type { CSSProperties } from 'react'
import type { Preview } from '@storybook/react'
import { I18nProvider } from '@/i18n/provider'
import type { Locale } from '@/i18n/t'

const preview: Preview = {
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'ja',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ja', title: '日本語 (ja)' },
          { value: 'en', title: 'English (en)' },
        ],
        showName: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const locale = (context.globals.locale ?? 'ja') as Locale
      return createElement(
        'div',
        {
          style: {
            '--font-body': '"Noto Sans JP"',
            '--font-heading': '"Shippori Mincho"',
          } as CSSProperties,
        },
        createElement(
          I18nProvider,
          { locale },
          createElement(Story, {}),
        ),
      )
    },
  ],

  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
}
export default preview
