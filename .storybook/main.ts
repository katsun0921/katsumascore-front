// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import { resolve, dirname } from 'path';
import tailwindcss from '@tailwindcss/vite'
import type { StorybookConfig } from '@storybook/react-vite'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = resolve(__dirname, '../src')
const publicDir = resolve(__dirname, '../public')
const assetsDir = resolve(__dirname, '../src/assets')
const uiProposalsDir = resolve(__dirname, '../src/ui-proposals')
const sassAdditionalData = `@use "${resolve(__dirname, '../src/styles/scss/global/variable/colors.scss')}" as *; @use "${resolve(__dirname, '../src/styles/scss/global/variable/fontWeight.scss')}" as *;`

/** GitHub Pages などサブパス配信時は `STORYBOOK_BASE_PATH=/repo-name/` を CI で渡す */
const storybookBase = process.env.STORYBOOK_BASE_PATH?.trim() || '/'

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/ui-proposals/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  staticDirs: [
    { from: publicDir, to: '/' },
    { from: uiProposalsDir, to: '/ui-proposals' },
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-vitest'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.base = storybookBase
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    config.css = config.css ?? {}
    config.css.preprocessorOptions = config.css.preprocessorOptions ?? {}
    config.css.preprocessorOptions.scss = {
      ...(config.css.preprocessorOptions.scss ?? {}),
      additionalData: sassAdditionalData,
    }
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@public': publicDir,
      '@assets': assetsDir,
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
