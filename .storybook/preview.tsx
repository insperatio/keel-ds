import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/index.css'

/**
 * Keel's modes are a class on <html>, the same switch the app uses, so a story is rendered by
 * exactly the CSS the product ships. The toolbar control sets it for every story.
 */
const withMode: Decorator = (Story, context) => {
  const mode = context.globals.mode === 'dark' ? 'dark' : 'light'
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.style.colorScheme = mode
  return (
    <div className="bg-surface-page p-6 text-fg-primary">
      <Story />
    </div>
  )
}

const preview: Preview = {
  decorators: [withMode],
  globalTypes: {
    mode: {
      description: 'Light or dark, the same class the app toggles',
      toolbar: {
        title: 'Mode',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { mode: 'light' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Keel's own surfaces are the background; a separate background control would lie about contrast.
    backgrounds: { disable: true },
    a11y: {
      // Run axe against the WCAG 2.2 A and AA rules the project is held to everywhere else,
      // and fail the story rather than only annotating it.
      config: { rules: [] },
      options: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      test: 'error',
    },
  },
}

export default preview
