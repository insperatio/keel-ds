import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-designs'],
  framework: { name: '@storybook/react-vite', options: {} },
  // react-docgen, not react-docgen-typescript: TypeScript 7 no longer exposes the JS compiler
  // API that the TypeScript variant needs.
  typescript: { reactDocgen: 'react-docgen' },
}

export default config
