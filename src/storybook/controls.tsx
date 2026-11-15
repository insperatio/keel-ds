import { Check, ChevronDown, Download, Pencil, Plus, Trash2 } from 'lucide-react'

/**
 * Controls for props that take a ReactNode.
 *
 * Storybook infers an object editor for a ReactNode prop, and the moment someone clicks
 * "Set object" the prop becomes `{}` — which React can't render, so the preview dies with
 * error #31. Anything a person can click in Storybook has to survive being clicked, so every
 * ReactNode prop gets a control it can't be broken with:
 *
 * - `iconControl` — a list of real icons, which also shows what the prop is for
 * - `textControl` — a text box, for props that hold a label or a sentence
 * - `hiddenControl` — for props the story supplies itself, so editing them would do nothing
 */
const icons = {
  None: undefined,
  Plus: <Plus />,
  Check: <Check />,
  Pencil: <Pencil />,
  Trash: <Trash2 />,
  Download: <Download />,
  ChevronDown: <ChevronDown />,
}

export const iconControl = {
  control: { type: 'select' as const },
  options: Object.keys(icons),
  mapping: icons,
}

export const textControl = { control: { type: 'text' as const } }

export const hiddenControl = { control: false as const, table: { disable: true } }
