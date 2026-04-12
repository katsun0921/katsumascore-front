import '@/styles/globals.css'
import { createElement } from 'react'
import type { CSSProperties } from 'react'
import type { Preview } from '@storybook/react-vite'
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
    options: {
      storySort: (a, b) => {
        const titleA = a.title
        const titleB = b.title

        if (titleA === titleB) {
          return 0
        }

        if (titleA === 'Docs/Overview') {
          return -1
        }

        if (titleB === 'Docs/Overview') {
          return 1
        }

        if (titleA.startsWith('Docs/') && !titleB.startsWith('Docs/')) {
          return -1
        }

        if (!titleA.startsWith('Docs/') && titleB.startsWith('Docs/')) {
          return 1
        }

        return titleA.localeCompare(titleB, 'ja')
      },
    },
    backgrounds: {
      options: {
        light: { name: 'light', value: '#FFFFFF' },
        dark: { name: 'dark', value: '#111827' }
      }
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'light'
    }
  }
}
export default preview
