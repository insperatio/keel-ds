---
description: Build a new page with Keel, then prove it passes every check
argument-hint: what the page is for, e.g. "billing settings with a plan card and an invoice table"
---

# /new-page

Build a new page using only Keel components and token classes: $ARGUMENTS

Work in this order. Don't skip the reading: it's shorter than fixing what you get wrong without it.

## 1. Read first

- `AGENTS.md` — the rules, each with its reason.
- `docs/rules/<component>.md` for every component you're about to use.
- `src/demo/SettingsPage.tsx` — a real page built only from Keel. Copy its patterns.

## 2. Decide the shape before writing code

Answer these in a sentence each, in your reply:

- **What is this page for?** One job, in the user's words.
- **What's the main action?** That's the one primary button on the page.
- **What are the sections?** Each becomes a `Card` with a `CardTitle as="h2"`, or a plain
  section with an `h2`.
- **What does each section hold?** Pick the component from its rule file, not from habit:
  a `Table` for rows people compare, a `Card` grid for separate objects, `Field` + `Input`
  or `Select` for things people type or pick, `Switch` for settings that apply at once,
  `Checkbox` for choices saved with a form.

If the request is ambiguous about something that changes the structure, ask one question.
Otherwise build, and say which reading you took.

## 3. Build it

```tsx
<AppShell topNav={…} sidebar={<SidebarNav label="…" sections={…} />}>
  <PageHeader title="…" description="…" actions={<Button variant="primary">…</Button>} />
  …sections…
</AppShell>
```

- One `h1` per page, in `PageHeader`. Sections use `h2`, chosen by structure, not size.
- Only token classes: `text-fg-*`, `bg-surface-*`, `border-line-*`, `text-body-*`, `p-4`, `gap-3`,
  `rounded-lg`. No hex, no `bg-blue-600`, no `text-[13px]`, no `opacity-50`, no inline `style`.
- Forms go in `Form`, each control in a `Field` with a visible `FieldLabel` and a `FieldError`
  that says what to do.
- Give a flex or grid child `min-w-0` when it holds a `Table`, `Tabs` or long text.
- Anything that saves, deletes or sends: confirm destructive actions with `AlertDialog`, and
  report the result with `useToast`. Never leave the result only in a toast.

## 4. Register it

A page file lives in `src/demo/` and is named for what it is: `BillingPage.tsx`, `SettingsPage.tsx`.
Two edits make it real:

- **`src/demo/shell.tsx`** — add `{ id: 'billing', label: 'Billing' }` to `PAGES`. That one line
  gives you the route type, the hash parser and the navigation entry.
- **`src/App.tsx`** — add the branch that renders it for that id.

Nothing else. The navigation comes from `PAGES`, and `check:ui` visits whatever the navigation
lists, so the page is covered by the browser checks as soon as it is reachable. A demo page needs
no story, no rule file and no `llms.txt` entry — those are for components and documents.

## 5. Check it, and fix what fails

```bash
npm run check
```

That is the whole gate, and the same set CI runs — see [AGENTS.md](../../AGENTS.md#commands).
Within it, `check:ui` drives a real browser in light and dark: control heights, a visible focus
ring at 3:1 on every tab stop, 24px targets, axe for WCAG 2.2 AA, and reflow at 320px with no
sideways scrolling. It visits whatever pages the app's own navigation lists, so a page registered
in step 4 is checked from that moment — nothing to add to a test file.

Fix the cause, never the threshold. If a check fails because Keel is missing something — a token,
a wrapping footer, a component that won't shrink — fix it in the component and say so. That's a
gap in the system, not in the page.

## 6. Hand it back

Report, briefly:

- the page's job and the reading you took, if anything was ambiguous;
- what you built it from, by component;
- the check results, including the numbers from `check:ui`;
- anything you changed in Keel itself, and why.
