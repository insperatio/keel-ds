/**
 * Where each component lives in the Keel Figma file.
 *
 * Storybook shows these in the Design tab, so a developer reading a story can open the
 * frame it was built from. The ids live here rather than in thirteen story files, so a
 * moved frame is one edit, and `check:docs` can prove every component has a link.
 */
const FILE = 'https://www.figma.com/design/gN42qTjWd2uh9pjCG8JW69/Keel-Design-System'

const NODES = {
  foundations: '9-2',
  button: '25-291',
  'icon-button': '26-147',
  input: '27-33',
  select: '28-48',
  checkbox: '38-65',
  switch: '39-45',
  badge: '40-67',
  tabs: '41-20',
  card: '44-43',
  table: '45-46',
  dialog: '46-58',
  toast: '48-71',
} as const

export type FigmaComponent = keyof typeof NODES

/** The frame's URL, for a link in prose or a doc. */
export const figmaUrl = (component: FigmaComponent) => `${FILE}?node-id=${NODES[component]}`

/** Story parameters that put the frame in Storybook's Design tab. */
export const figma = (component: FigmaComponent) => ({
  design: { type: 'figma' as const, url: figmaUrl(component) },
})
