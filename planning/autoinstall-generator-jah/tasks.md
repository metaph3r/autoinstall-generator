# Application Shell & Layout — Issue Breakdown

> **Epic:** autoinstall-generator-jah — Application Shell & Layout
> **Source:** `planning/autoinstall-generator-jah/implementation-plan.md`
> **Total issues:** 6
> **Estimated tests:** ~21

---

## ISSUE-1: Implement AutoinstallConfigContext stub

**Type:** task | **Priority:** P1 | **Effort:** S

**Description:**
Create `src/context/AutoinstallConfigContext.tsx`. This module provides the React Context and
`useAutoinstallConfig()` custom hook that the entire application consumes for state access. In
this epic the context is a **stub**: it ships a no-op reducer and a minimal initial state
`{ version: 1 }`. The full reducer and complete `AutoinstallConfig` type will be implemented
by epic autoinstall-generator-pqx, which will replace the stub internals while keeping the
exported hook API identical.

The stub is required before `App.tsx` can be wired up (ISSUE-6), and its **exported hook API
is the stable integration point** for all downstream epics. The hook must throw a descriptive
error when called outside the Provider — this is an explicit safety contract.

**Acceptance Criteria:**
- [ ] `src/context/AutoinstallConfigContext.tsx` exists and compiles under TypeScript strict mode
- [ ] Exports `AutoinstallConfig` interface with at least `version: number` field
- [ ] Exports `AutoinstallAction` type (`{ type: string; payload?: unknown }`)
- [ ] Exports `AutoinstallConfigContextValue` interface with `state: AutoinstallConfig` and `dispatch: React.Dispatch<AutoinstallAction>`
- [ ] Exports `AutoinstallConfigProvider` component that wraps children with the context
- [ ] Exports `useAutoinstallConfig()` hook that returns `AutoinstallConfigContextValue`
- [ ] `useAutoinstallConfig()` throws `Error('useAutoinstallConfig must be used within AutoinstallConfigProvider')` when called outside a Provider
- [ ] Stub reducer is a no-op pass-through: calling `dispatch` does not mutate state
- [ ] 2 tests pass in a co-located or inline test file: (1) hook throws outside Provider; (2) hook returns `state` and `dispatch` inside Provider
- [ ] `eslint .` reports zero errors for this file
- [ ] No MUI, yaml, or react-hook-form imports (pure React)

**Dependencies:**
- Blocks: ISSUE-6 (App root imports `AutoinstallConfigProvider`)
- Cross-epic: autoinstall-generator-pqx will replace stub internals; the exported hook API
  (`useAutoinstallConfig` signature, provider name) must not change

---

## ISSUE-2: Implement ErrorBoundary component

**Type:** task | **Priority:** P1 | **Effort:** S

**Description:**
Create `src/components/ErrorBoundary.tsx`. This is a React **class component** — required
because `getDerivedStateFromError` and `componentDidCatch` are class-only lifecycle methods
(no function-component equivalent in React 18 without an external library). This is an
intentional, documented exception in an otherwise all-hooks codebase.

The component wraps any subtree and catches unexpected runtime errors, rendering a user-friendly
fallback instead of a white screen. It accepts an optional `fallback` prop for caller-supplied
error UI.

No tests are needed for axe compliance here — the component only renders either `children`
(normal path, tested by other component tests) or a plain MUI Box/Typography fallback (covered
by ISSUE-2 tests).

**Acceptance Criteria:**
- [ ] `src/components/ErrorBoundary.tsx` exists and compiles under TypeScript strict mode
- [ ] `ErrorBoundary` is a class component extending `React.Component<ErrorBoundaryProps, ErrorBoundaryState>`
- [ ] `ErrorBoundaryProps` has `children: React.ReactNode` and `fallback?: React.ReactNode`
- [ ] `ErrorBoundaryState` has `hasError: boolean` and optional `error?: Error`
- [ ] `getDerivedStateFromError` sets `hasError: true` and captures the error
- [ ] `componentDidCatch` calls `console.error` with error and info (v1 logging)
- [ ] When `hasError` is false: renders `children` unchanged
- [ ] When `hasError` is true and no `fallback` prop: renders default MUI Box with headings "Something went wrong" and a reload instruction
- [ ] When `hasError` is true and `fallback` prop provided: renders the custom `fallback` node instead of the default
- [ ] 3 tests pass in `src/components/ErrorBoundary.test.tsx`:
  - (1) renders children when no error occurs
  - (2) renders default fallback text ("Something went wrong") when a child throws
  - (3) renders custom fallback node when `fallback` prop is provided and child throws
- [ ] `eslint .` reports zero errors for this file

**Dependencies:**
- Blocks: ISSUE-6 (App root wraps tree with `ErrorBoundary`)

---

## ISSUE-3: Implement StartPage component

**Type:** task | **Priority:** P1 | **Effort:** S

**Description:**
Create `src/components/StartPage.tsx` and `src/components/StartPage.test.tsx`. This is the
landing page shown at initial application load. It renders introductory text about the tool and
a "New Project" button. It is a pure presentational component with no state of its own —
navigation is delegated to the parent via the `onStart` callback prop.

This component must pass `jest-axe` with zero critical violations. MUI `Button` and `Typography`
provide ARIA-compliant markup by default; no manual ARIA instrumentation is required here.

**Acceptance Criteria:**
- [ ] `src/components/StartPage.tsx` exists and compiles under TypeScript strict mode
- [ ] Component is a named export: `export function StartPage({ onStart }: StartPageProps): JSX.Element`
- [ ] `StartPageProps` interface has `onStart: () => void`
- [ ] Rendered output includes a heading (MUI `Typography variant="h4"` or equivalent) containing the application name "Autoinstall Generator"
- [ ] Rendered output includes a MUI `Button` with accessible name "New Project"
- [ ] Clicking the "New Project" button calls `onStart` exactly once
- [ ] 4 tests pass in `src/components/StartPage.test.tsx`:
  - (1) heading text is present in the DOM (`getByRole('heading')` finds "Autoinstall Generator")
  - (2) button is present in the DOM (`getByRole('button', { name: /new project/i })` succeeds)
  - (3) clicking the button calls the `onStart` spy once (`vi.fn()`)
  - (4) `axe(container)` reports zero violations
- [ ] `eslint .` reports zero errors for this file

**Dependencies:**
- Blocks: ISSUE-5 (AppShell imports and renders StartPage)

---

## ISSUE-4: Implement FormEditor layout shell

**Type:** task | **Priority:** P1 | **Effort:** S

**Description:**
Create `src/components/FormEditor.tsx` and `src/components/FormEditor.test.tsx`. This is the
main workspace component that provides the two-column responsive layout shell. In this epic it
renders **placeholder content only** — the actual form sections (autoinstall-generator-dez,
-gni, -mb1, -wxk, -7y4) and YAML preview panel (autoinstall-generator-zfe) will be injected
into these columns by downstream epics.

The layout must use MUI `Box` with `sx` flexbox responsive props:
`flexDirection: { xs: 'column', md: 'row' }` — column on mobile (< 900px), row on desktop.
Left column is 60% width on desktop, right column is 40%.

The jsdom test environment has no CSS layout engine, so responsive stacking cannot be tested
via rendered layout. The responsive spec is verified by asserting the `sx` prop value in the
rendered tree (or via snapshot).

**Acceptance Criteria:**
- [ ] `src/components/FormEditor.tsx` exists and compiles under TypeScript strict mode
- [ ] Component is a named export: `export function FormEditor(): JSX.Element`
- [ ] The outer container renders a MUI `Box` with `sx.display: 'flex'` and `sx.flexDirection: { xs: 'column', md: 'row' }`
- [ ] Left column placeholder box is present and distinguishable (e.g., `data-testid="form-sections"` or identifiable text)
- [ ] Right column placeholder box is present and distinguishable (e.g., `data-testid="yaml-preview"` or identifiable text)
- [ ] Left column has `flex` value resolving to approximately 60% on desktop (e.g., `flex: { md: '0 0 60%' }`)
- [ ] Right column has `flex` value resolving to approximately 40% on desktop (e.g., `flex: { md: '0 0 40%' }`)
- [ ] 4 tests pass in `src/components/FormEditor.test.tsx`:
  - (1) component renders without crashing
  - (2) form sections placeholder is present in the DOM
  - (3) YAML preview placeholder is present in the DOM
  - (4) `axe(container)` reports zero violations
- [ ] Component does not import any context, form libraries, or YAML libraries (pure layout)
- [ ] `eslint .` reports zero errors for this file

**Dependencies:**
- Blocks: ISSUE-5 (AppShell imports and renders FormEditor)
- Cross-epic: autoinstall-generator-dez will populate the left column; autoinstall-generator-zfe will populate the right column — the column container DOM structure (test IDs or roles) must remain stable

---

## ISSUE-5: Implement AppShell component

**Type:** feature | **Priority:** P1 | **Effort:** M

**Description:**
Create `src/components/AppShell.tsx` and `src/components/AppShell.test.tsx`. This is the
top-level layout host for the application. It renders:
1. A persistent MUI `AppBar` with the application title ("Autoinstall Generator") and a GitHub
   icon link (`@mui/icons-material/GitHub`) with `aria-label="View source on GitHub"`
2. Client-side page routing via `useState<'start' | 'editor'>('start')` — **no router library**
3. Conditional rendering: `StartPage` on `'start'`, `FormEditor` on `'editor'`

The GitHub `IconButton` must be rendered as an `<a>` tag (using MUI's `component="a"`) so
screen readers identify it as a link, not a button.

**Acceptance Criteria:**
- [ ] `src/components/AppShell.tsx` exists and compiles under TypeScript strict mode
- [ ] Component is a named export: `export function AppShell(): JSX.Element`
- [ ] Renders a MUI `AppBar` with `Toolbar`
- [ ] `Toolbar` contains a `Typography` element with text "Autoinstall Generator"
- [ ] `Toolbar` contains an `IconButton` rendered as `<a>` (via `component="a"`) with `aria-label="View source on GitHub"`, `target="_blank"`, and `rel="noopener noreferrer"`
- [ ] On initial render, `StartPage` is visible (`getByRole('button', { name: /new project/i })` succeeds)
- [ ] `FormEditor` is NOT visible on initial render
- [ ] After clicking the "New Project" button, `FormEditor` is rendered and `StartPage` is not
- [ ] No router library is imported or used
- [ ] 5 tests pass in `src/components/AppShell.test.tsx`:
  - (1) AppBar title "Autoinstall Generator" is in the DOM
  - (2) GitHub icon link has `aria-label="View source on GitHub"` and is rendered as a link (`getByRole('link', { name: /view source on github/i })` succeeds)
  - (3) `StartPage` is rendered on initial load
  - (4) Clicking "New Project" button transitions to `FormEditor` (verifiable by presence of form/YAML placeholder elements)
  - (5) `axe(container)` reports zero violations (tested against the initial `StartPage` render)
- [ ] `eslint .` reports zero errors for this file

**Dependencies:**
- Blocked by: ISSUE-3 (imports `StartPage`), ISSUE-4 (imports `FormEditor`)
- Blocks: ISSUE-6 (App root renders `AppShell`)

---

## ISSUE-6: Wire App root and update integration tests

**Type:** task | **Priority:** P1 | **Effort:** S

**Description:**
Replace the placeholder `src/App.tsx` implementation and update `src/App.test.tsx` to verify
the fully wired application. `App` becomes the composition root that connects:

```
<ErrorBoundary>
  <AutoinstallConfigProvider>
    <AppShell />
  </AutoinstallConfigProvider>
</ErrorBoundary>
```

This is not implementing new functionality — it is stitching together the modules built in
ISSUE-1 through ISSUE-5. The existing `App.test.tsx` tests must be updated because the old
stub (`<div>Autoinstall Generator — setup complete</div>`) is gone.

**Acceptance Criteria:**
- [ ] `src/App.tsx` imports `ErrorBoundary`, `AutoinstallConfigProvider`, and `AppShell` and composes them in the order shown above
- [ ] `src/App.tsx` has no other logic — it is purely a composition root
- [ ] The old placeholder `<div>Autoinstall Generator — setup complete</div>` is removed
- [ ] `src/App.test.tsx` contains exactly 3 tests:
  - (1) `render(<App />)` does not throw; container is in the document
  - (2) After render, `StartPage` is visible — `getByRole('button', { name: /new project/i })` returns an element
  - (3) `axe(container)` reports zero violations
- [ ] All 21 tests across the epic pass with `vitest run` (no regressions)
- [ ] `vitest run --coverage` shows ≥ 90% lines, branches, functions, statements for all files in `src/` (excluding `src/main.tsx`, `src/test/`, and `*.test.tsx` files per `vite.config.ts` coverage exclude config)
- [ ] `tsc --noEmit` exits with code 0
- [ ] `eslint .` exits with code 0

**Dependencies:**
- Blocked by: ISSUE-1 (`AutoinstallConfigProvider`), ISSUE-2 (`ErrorBoundary`), ISSUE-5 (`AppShell`)

---

## Dependency Map

### Critical Path

The longest dependency chain is 3 issues deep:

```
ISSUE-3 (StartPage) ──┐
                       ├──► ISSUE-5 (AppShell) ──► ISSUE-6 (App root)
ISSUE-4 (FormEditor) ──┘

ISSUE-1 (Context stub) ────────────────────────►──┘ (also blocks ISSUE-6)
ISSUE-2 (ErrorBoundary) ───────────────────────►──┘ (also blocks ISSUE-6)
```

**Minimum sequential depth:** 3 issues (e.g., ISSUE-3 → ISSUE-5 → ISSUE-6)
**Wall-clock critical path:** Phase 1 (any one of ISSUE-3/ISSUE-4) → Phase 2 (ISSUE-5) → Phase 3 (ISSUE-6)

### Parallel Work Opportunities

| Phase | Issues | Max Parallelism | Notes |
|-------|--------|----------------|-------|
| Phase 1 | ISSUE-1, ISSUE-2, ISSUE-3, ISSUE-4 | 4 | All are leaf modules |
| Phase 2 | ISSUE-5 | 1 | No parallelism; blocked by 3+4 |
| Phase 3 | ISSUE-6 | 1 | Final integration; blocked by 1+2+5 |

For a two-developer split:
- **Dev A:** ISSUE-1 → ISSUE-3 → ISSUE-5 → ISSUE-6
- **Dev B:** ISSUE-2 → ISSUE-4 → (assist with ISSUE-6 review)

### Cross-Epic Dependencies

| Dependency | Type | Status | Impact if Blocked |
|-----------|------|--------|-----------------|
| autoinstall-generator-6yq (Project Setup) | hard (completed) | ✓ Closed | No impact — scaffold exists |
| autoinstall-generator-pqx (Core State) | loose (parallel) | Open | Will replace context stub internals; `useAutoinstallConfig()` hook API must remain stable |
| autoinstall-generator-dez (Form Navigation) | hard (this epic blocks dez) | Open | dez cannot start until ISSUE-4 + ISSUE-5 are done |
| autoinstall-generator-zfe (YAML Preview) | hard (this epic blocks zfe) | Open | zfe cannot start until ISSUE-4 (FormEditor shell) is done |
| autoinstall-generator-ejs (YAML Escape Hatch) | hard (blocked by pqx) | Open | Not directly blocked by this epic; uses context hook |

### Infrastructure Loose Gates

No infrastructure-level loose gates apply to this epic. All components are pure SPA modules
with no external service dependencies. The GitHub Pages deployment (ADR-002) is already
configured from epic autoinstall-generator-6yq. The CI pipeline (`lint → type-check → test →
build → deploy`) will verify this epic's output on merge to `main`.
