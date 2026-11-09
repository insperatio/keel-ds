import { createCn } from 'cn/config'
import light from '@/tokens/semantic/light.tokens.json'

// Keel's text styles (text-body-md, text-label-md, ...) are font sizes. Without this,
// cn treats them as colors and drops the real color in `text-label-md text-fg-primary`.
// Read from the token file, so a new text style is covered automatically.
const textStyles = Object.keys(light['text-style']).filter((k) => !k.startsWith('$'))

export const cn = createCn({
  extend: { classGroups: { 'font-size': [{ text: textStyles }] } },
})
