# Quickstart for AI tools

The five-minute version of [AGENTS.md](../AGENTS.md). If you only read one page before writing
code with Keel, read that one; this page is the shape of it.

## In one paragraph

Keel is a React design system where every color, size, radius, shadow and duration comes from
token files. The tokens are checked for contrast, for staying on a 4px grid, and for matching
between light and dark mode, so using them is what makes the result accessible. You do not need
to think about hex values, focus rings or dark mode: use the components and the token classes,
and those are handled.

## What to read, in order

1. [AGENTS.md](../AGENTS.md) — all 33 rules, each with its reason.
2. The rule file for the component you're using: `docs/rules/<component>.md`.
3. [src/demo/SettingsPage.tsx](../src/demo/SettingsPage.tsx) — a real page built only from Keel.

## What to run

```bash
npm install
npm run dev          # the demo: tokens, components, an example settings page
npm run tokens       # rebuild the tokens, then check them
npm run tokens:check # contrast pairs, aliases, grid, generated files up to date
npm run check:ui     # build, then test the pages in a real browser, light and dark
npm run check:docs   # rule files still match the components they describe
npm run lint
```

**Done means** `tokens:check`, `check:ui`, `check:docs` and `lint` all pass. If a check fails,
fix the cause; never lower a threshold to make it pass.

## The ten mistakes that break a Keel build

1. A raw color: `#1a73e8`, `rgb(...)`, or `bg-blue-600`. The Tailwind palette is removed on
   purpose. Use `bg-action-primary-bg`, `text-fg-secondary`, `border-line-subtle`.
2. `opacity-50` for a disabled state. Use the `disabled` prop; it uses the disabled tokens.
3. An off-scale size: `text-[13px]`, `p-[13px]`. Use `text-body-sm`, `p-3`.
4. `outline-none` with nothing to replace it. The focus ring is the one thing you never remove.
5. Color as the only cue for a state. Pair it with text, an icon, a check mark or a bar.
6. `<div onClick>`. Use `<Button>` for actions and `<a href>` for navigation.
7. An input with no `Field` and no visible label, with the placeholder standing in for one.
8. Two primary buttons in one group. One primary, everything else secondary or ghost.
9. Editing a generated file (`src/styles/keel.css`, the generated token files,
   `figma/plugin/code.js`). Edit the source and run `npm run tokens`.
10. Adding a `.md` file and not listing it in `llms.txt`. The index is how tools find the docs.

## The shape of a page

```tsx
<AppShell topNav={nav} sidebar={<SidebarNav label="Settings" sections={sections} />}>
  <PageHeader title="Workspace settings" description="…" actions={<Button variant="primary">Save</Button>} />
  <Card>
    <CardHeader>
      <CardTitle as="h2">Profile</CardTitle>
      <CardDescription>How you appear to your team.</CardDescription>
    </CardHeader>
    <CardContent>
      <Field name="name">
        <FieldLabel>Full name</FieldLabel>
        <Input required />
        <FieldError match="valueMissing">Enter your name.</FieldError>
      </Field>
    </CardContent>
  </Card>
</AppShell>
```

One `h1` per page, in `PageHeader`. Headings inside go `h2`, `h3`, by structure rather than size.

## Making it your brand

Copy `src/tokens/brands/keel.brand.json`, change the name, accent hue, neutral tint, font and
radius, then run `BRAND=yourbrand npm run tokens`. The ramps are regenerated and the contrast
checks run against your colors, so an inaccessible brand fails the build instead of shipping.
See [brand.md](brand.md).
