import type { Preview } from '@storybook/react'
// globals.css（Tailwind）は読み込まない
// SCSSはviteのadditionalDataで自動注入済み

const preview: Preview = {
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
