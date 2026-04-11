import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import type { StorybookConfig } from '@storybook/react-vite'

const srcDir = resolve(__dirname, '../src')
const publicDir = resolve(__dirname, '../public')

/** GitHub Pages などサブパス配信時は `STORYBOOK_BASE_PATH=/repo-name/` を CI で渡す */
const storybookBase = process.env.STORYBOOK_BASE_PATH?.trim() || '/'

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  staticDirs: [{ from: publicDir, to: '/' }],
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
    config.base = storybookBase
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@/assets': publicDir,
      '@': srcDir,
      'next/image': resolve(__dirname, './mocks/nextImage.tsx'),
      'next/router': resolve(__dirname, './mocks/nextRouter.tsx'),
      'next/link': resolve(__dirname, './mocks/nextLink.tsx'),
    }
    config.define = config.define ?? {}
    config.define['process.env'] = {}
    return config
  },
}
export default config
