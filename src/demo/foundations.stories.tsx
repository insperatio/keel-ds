// The tokens, in Storybook. Like src/demo/TokensPage.tsx, this file's subject is the tokens
// themselves, so it reads their values from the token files and paints with them directly.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { colorGroups, colorRoles, durations, radii, ramps, shadows, spacing, textStyles } from './token-data'

const meta: Meta = {
  title: 'Foundations',
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj

function Section({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-heading-md">{title}</h2>
        <p className="mt-1 max-w-2xl text-body-sm text-fg-secondary">{blurb}</p>
      </div>
      {children}
    </section>
  )
}

/**
 * The roles components use. Each one points at a primitive, and points somewhere different in
 * dark mode: switch the mode in the toolbar and watch every swatch move.
 */
export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      {colorGroups.map((group) => (
        <Section key={group.id} title={group.title} blurb={group.blurb}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {colorRoles
              .filter((role) => role.path.startsWith(`${group.id}.`))
              .map((role) => (
                <li key={role.path} className="flex items-center gap-3">
                  <div
                    className="size-10 shrink-0 rounded-lg border border-line-subtle"
                    style={{ background: `var(${role.cssVar})` }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-label-sm">{role.path}</p>
                    <p className="truncate text-caption text-fg-tertiary">{role.cssVar}</p>
                  </div>
                </li>
              ))}
          </ul>
        </Section>
      ))}
    </div>
  ),
}

/** The generated ramps. Semantic roles point at these; components never use them directly. */
export const Ramps: Story = {
  render: () => (
    <Section title="Ramps" blurb="Generated from the brand file in OKLCH, fitted into sRGB, then checked for contrast.">
      <div className="flex flex-col gap-4">
        {ramps.map((ramp) => (
          <div key={ramp.name}>
            <p className="text-label-sm">{ramp.name}</p>
            <ol className="mt-1 grid grid-cols-11 gap-1">
              {ramp.steps.map((step) => (
                <li key={step.step}>
                  <div className="h-10 rounded-md border border-line-subtle" style={{ background: step.hex }} title={`${ramp.name}.${step.step} ${step.hex}`} />
                  <p className="mt-1 text-caption text-fg-tertiary">{step.step}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Section>
  ),
}

/** Each style pairs a size, line height, weight and letter spacing. Never a loose font size. */
export const Type: Story = {
  render: () => (
    <Section title="Type" blurb="Thirteen styles, all on the 4px grid.">
      <ul className="flex flex-col gap-5">
        {textStyles.map((style) => (
          <li key={style.name} className="flex flex-col gap-1 border-b border-line-subtle pb-4 last:border-b-0">
            <p className="text-caption text-fg-tertiary">
              text-{style.name} · {style.size} / {style.lineHeight} · {style.weight}
            </p>
            <p className={`text-${style.name}`}>The quick brown fox jumps over the lazy dog</p>
          </li>
        ))}
      </ul>
    </Section>
  ),
}

/** Spacing, radius, shadow and motion: the rest of the scale. */
export const Scales: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Section title="Spacing" blurb="A 4px grid, with one half step for hairline gaps.">
        <ul className="flex flex-col gap-2">
          {spacing.map((space) => (
            <li key={space.name} className="flex items-center gap-3">
              <span className="w-12 text-caption text-fg-tertiary">{space.name}</span>
              <span className="w-12 text-caption text-fg-tertiary">{space.px}px</span>
              <div className="h-3 rounded-sm bg-line-default" style={{ width: space.px }} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Radius" blurb="Set by the brand file: sharp halves these, rounded multiplies them by 1.5.">
        <ul className="flex flex-wrap gap-4">
          {radii.map((radius) => (
            <li key={radius.name} className="flex flex-col items-center gap-2">
              <div className="size-16 border-2 border-line-control bg-surface-subtle" style={{ borderRadius: radius.value }} />
              <span className="text-caption text-fg-tertiary">{radius.name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Shadow" blurb="Tinted with the darkest neutral, so shadows belong to the brand.">
        <ul className="flex flex-wrap gap-6">
          {shadows.map((shadow) => (
            <li key={shadow.name} className="rounded-xl bg-surface-raised p-5" style={{ boxShadow: `var(--keel-shadow-${shadow.name})` }}>
              <span className="text-caption text-fg-tertiary">{shadow.name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Motion" blurb="Nothing longer than 400ms, and every transition respects reduced motion.">
        <ul className="flex flex-col gap-2">
          {durations.map((duration) => (
            <li key={duration.name} className="flex items-center gap-3">
              <span className="w-16 text-caption text-fg-tertiary">{duration.name}</span>
              <span className="text-caption text-fg-tertiary">{duration.ms}ms</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  ),
}
