import '@/styles/globals.css'
import { createElement } from 'react'
import type { CSSProperties } from 'react'
import type { Preview } from '@storybook/react'

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        'div',
        {
          style: {
            '--font-body': '"Noto Sans JP"',
            '--font-heading': '"Shippori Mincho"',
          } as CSSProperties,
        },
        createElement(Story, {}),
      ),
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
