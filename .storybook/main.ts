import { resolve } from 'path'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
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
      '@': resolve(__dirname, '../src'),
      '@/scss': resolve(__dirname, '../src/scss'),
      '@/assets': resolve(__dirname, '../src/assets'),
    }
    // SCSSカラー変数・フォント変数を全SCSSに自動注入
    config.css = {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/scss/global/variable/_colors.scss" as *; @use "@/scss/global/variable/_fontWeight.scss" as *;`,
        },
      },
    }
    return config
  },
}
export default config
