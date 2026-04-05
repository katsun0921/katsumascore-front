import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import type { StorybookConfig } from '@storybook/react-vite'

const srcDir = resolve(__dirname, '../src')
const publicDir = resolve(__dirname, '../public')

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@whitespace/storybook-addon-html',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@/assets': publicDir,
      '@': srcDir,
      'next/image': resolve(__dirname, './mocks/nextImage.tsx'),
      'next/router': resolve(__dirname, './mocks/nextRouter.tsx'),
    }
    return config
  },
}
export default config
