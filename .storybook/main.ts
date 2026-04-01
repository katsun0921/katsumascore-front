import { resolve } from 'path'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@whitespace/storybook-addon-html',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: [{ from: '../public/', to: '/' }],
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      '@': resolve(__dirname, '..'),
      '@/scss': resolve(__dirname, '../styles/scss'),
      '@/assets': resolve(__dirname, '../public'),
    }
    // SCSSカラー変数・フォント変数を全SCSSに自動注入
    config.css = {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/scss/global/variable/colors.scss" as *; @use "@/scss/global/variable/fontWeight.scss" as *;`,
        },
      },
    }
    return config
  },
}
export default config
