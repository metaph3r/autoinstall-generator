# Implementation Plan: autoinstall-generator-jah
# Application Shell & Layout

**Epic:** autoinstall-generator-jah
**Priority:** P1
**Status:** Open
**Generated:** 2026-04-02

---

## Context

### Problem Statement

The project scaffold (autoinstall-generator-6yq) is complete: the build runs, CI passes, and
GitHub Pages deploys. However, the application renders only a placeholder `<div>`. There is no
application frame, no navigation, no layout structure, and no React Context — meaning no
downstream epic can begin.

This epic implements the structural skeleton the entire application hangs from: the root
component, the context provider, the AppBar, page routing between Start and Editor, and the
two-column responsive layout that hosts all form sections and the YAML preview.

### Desired Outcome

After this epic:
- The application has a visible, accessible shell (AppBar with title and GitHub link)
- A StartPage is reachable at initial load with a navigable "Start" button
- The FormEditor renders in a two-column layout (60/40) on desktop, stacked on mobile
- The `AutoinstallConfigContext` wraps the entire tree (even though no reducer logic is
  implemented yet — that is autoinstall-generator-pqx)
- An error boundary is in place as a production safety net
- All above components pass `jest-axe` with zero critical violations

### Arc42 References

| Reference | Relevance |
|-----------|-----------|
| §05 Building Block View (Level 1) | Defines App, AppShell, StartPage, FormEditor, AutoinstallConfigContext |
| §08 Crosscutting Concepts — Responsive Layout | Two-column 60/40 split, < md stacks |
| §08 Crosscutting Concepts — Error Handling | Error boundary as safety net |
| §08 Crosscutting Concepts — Accessibility | jest-axe CI gate, zero critical violations |
| §08 Crosscutting Concepts — State Management | useAutoinstallConfig() hook pattern |
| ADR-002 | Vitest + @testing-library/react + jest-axe test infrastructure |
| ADR-004 | MUI Tabs and Accordion for FormEditor (layout placeholder only in this epic) |
| ADR-005 | React 18+, MUI 6, Context+Reducer — confirmed choices |
| SPEC.md §Layout | Zweispaltig (60/40), responsive, YAML preview below on mobile |
| SPEC.md §Navigation | MUI AppBar, title, optional GitHub link |

---

## Scope

### In Scope (Acceptance Criteria from Epic)

1. AppBar renders application title ("Autoinstall Generator") and GitHub link
2. StartPage renders and navigates to FormEditor on button click
3. Two-column layout renders on desktop (≥ md), stacked on mobile (< md)
4. Error boundary catches and displays fallback on unexpected errors
5. Zero axe-core critical violations (jest-axe) for all new components

### Out of Scope

- Actual state management / reducer implementation — that is **autoinstall-generator-pqx**
- Form section content — that is **autoinstall-generator-gni**, **-mb1**, **-wxk**, **-7y4**
- YAML preview content — that is **autoinstall-generator-zfe**
- Tab navigation with content — that is **autoinstall-generator-dez** (blocked by this epic)
- YAML editor escape hatch — that is **autoinstall-generator-ejs**
- Export functionality (Copy, Download) — that is **autoinstall-generator-zfe**

---

## Architecture Constraints

| Constraint | Specification | Source |
|-----------|---------------|--------|
| No router library | Page routing via `useState` only; exactly 2 pages | §05 Level 1, footnote |
| MUI AppBar | Use MUI `AppBar` component | SPEC.md §Navigation |
| MUI Grid or Box with Flexbox | Two-column layout via MUI primitives | §08 Responsive Layout |
| MUI breakpoint `md` | Stacking below `md` (900px default) | §08 Responsive Layout |
| Context pattern | `useAutoinstallConfig()` custom hook; no direct `useContext` in components | §08 State Management |
| Error boundary | React class component `componentDidCatch`; v1 safety net | §08 Error Handling |
| Accessibility | WAI-ARIA via MUI baseline; manual `aria-*` only where required | §08 Accessibility |
| jest-axe CI gate | Zero critical violations; run in Vitest test suite | §08 Accessibility, ADR-002 |
| TypeScript strict mode | All new code strictly typed; no `any` except where documented | §02.1 |
| No `import React` | React 17+ JSX transform — `@vitejs/plugin-react` handles this | §08 Dev Experience |

---

## Key Design Decisions

### Decision 1: Context Stub vs. Full Reducer

**Decision:** This epic installs `AutoinstallConfigContext` with a minimal stub (empty initial
state object + identity dispatch function) rather than the full reducer. The full reducer is
autoinstall-generator-pqx which is a separate, parallel epic.

**Rationale:** The layout components only need the context to exist so that `useAutoinstallConfig()`
does not throw. The stub is replaced when autoinstall-generator-pqx lands. This allows both
epics to proceed without blocking on each other.

**Tradeoff:** A small amount of the context code will be overwritten by autoinstall-generator-pqx.
This is acceptable — the surface is minimal (a `createContext` call and a stub initial state).

---

### Decision 2: Two-Column Layout Implementation

**Decision:** Use MUI `Box` with `sx` flexbox props (not `Grid`) for the two-column layout:

```tsx
// FormEditor two-column layout sketch
<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
  <Box sx={{ flex: '0 0 60%' }}>
    {/* FormNavigation + FormContent placeholder */}
  </Box>
  <Box sx={{ flex: '0 0 40%' }}>
    {/* YamlPreviewPanel placeholder */}
  </Box>
</Box>
```

**Rationale:** MUI `Grid` v2 (MUI 6) uses CSS Grid internally and is appropriate for
page-level grids. For a simple two-column flex split with a single breakpoint, `Box` with
`sx` flexbox is less verbose, easier to read, and avoids the `Grid`/`Grid2` naming confusion
introduced in MUI 6 migration. The responsive `flexDirection` shorthand (`{ xs: 'column', md: 'row' }`)
directly maps to the arc42 spec.

**Tradeoff:** MUI Grid offers automatic `spacing` prop — not needed here. `Box` is the simpler choice.

---

### Decision 3: Error Boundary as Class Component

**Decision:** Implement the error boundary as a React class component, not a function component,
because React does not yet support error boundaries in function components.

**Rationale:** React's `componentDidCatch` / `getDerivedStateFromError` lifecycle methods are
class-only. The `react-error-boundary` library provides a function-component wrapper, but adding
a dependency for a single class component is not justified.

**Tradeoff:** One class component in an otherwise all-hooks codebase. Clearly documented as an
intentional exception.

---

### Decision 4: AppBar GitHub Link

**Decision:** Render the GitHub link as an MUI `IconButton` with `GitHubIcon` from
`@mui/icons-material`, linking to the project repository URL. The icon has an `aria-label`
("View source on GitHub") for screen reader accessibility.

**Rationale:** `@mui/icons-material` is already a declared dependency. An icon button in the
AppBar is the conventional MUI pattern for external links. The `aria-label` satisfies the
WCAG 2.1 AA requirement for icon-only interactive elements.

**Tradeoff:** Hardcoded repository URL is acceptable for v1 (no configuration system in this epic).

---

### Decision 5: FormEditor Layout Placeholders

**Decision:** `FormEditor` renders placeholder `Box` areas for form sections and YAML preview
(with descriptive text or empty `Box`). It does not render `FormNavigation` or real section
content — that is autoinstall-generator-dez and the Form Section epics.

**Rationale:** This epic's responsibility is the two-column layout shell, not the content.
Placeholder areas allow the layout to be visually verified and tested for responsiveness
and accessibility without depending on future epics.

**Tradeoff:** The placeholder divs will be replaced when downstream epics land. Minor rework,
no structural change.

---

## Project Structure

```
src/
├── App.tsx                          [MODIFIED] Root component — renders AppShell, provides context
├── App.test.tsx                     [MODIFIED] Update to verify AppBar + StartPage rendering
├── main.tsx                         [EXISTING] Entry point — no changes needed
├── vite-env.d.ts                    [EXISTING] No changes needed
│
├── context/
│   └── AutoinstallConfigContext.tsx [NEW] Context + stub reducer + useAutoinstallConfig() hook
│
├── components/
│   ├── AppShell.tsx                 [NEW] MUI AppBar + page routing (useState)
│   ├── AppShell.test.tsx            [NEW] Render + navigation + axe tests
│   ├── StartPage.tsx                [NEW] Landing page + Start button
│   ├── StartPage.test.tsx           [NEW] Render + button click + axe tests
│   ├── FormEditor.tsx               [NEW] Two-column responsive layout shell
│   ├── FormEditor.test.tsx          [NEW] Layout render + responsive test + axe tests
│   └── ErrorBoundary.tsx            [NEW] React class error boundary
│
└── test/
    └── setup.ts                     [EXISTING] Test setup (already configured)
```

**Module boundary:** This epic owns only the structural frame. The context stub
(`AutoinstallConfigContext.tsx`) will have its internals replaced by autoinstall-generator-pqx,
but its external API (the hook signature) must be stable.

---

## Module Specifications

### `src/context/AutoinstallConfigContext.tsx`

**Purpose:** Provides `AutoinstallConfigContext` to the entire component tree. In this epic,
implements a minimal stub that satisfies the hook API without implementing the full reducer.

**Public API:**
```typescript
// The config type (partial stub — full definition in autoinstall-generator-pqx)
interface AutoinstallConfig {
  version: number;
  // ... other fields defined in pqx epic
}

// Context value shape — stable API
interface AutoinstallConfigContextValue {
  state: AutoinstallConfig;
  dispatch: React.Dispatch<AutoinstallAction>;
}

// Stub action type — extended by pqx epic
type AutoinstallAction = { type: string; payload?: unknown };

// Custom hook — only valid API consumers should use
export function useAutoinstallConfig(): AutoinstallConfigContextValue;

// Provider component
export function AutoinstallConfigProvider({ children }: { children: React.ReactNode }): JSX.Element;
```

**Key design points:**
- `createContext` with `undefined` as default; `useAutoinstallConfig()` throws if used outside Provider
- Stub initial state: `{ version: 1 }` (satisfies required field; pqx will expand this)
- Stub reducer is a no-op pass-through: `(state, _action) => state`
- Types for `AutoinstallConfig` and `AutoinstallAction` are exported — pqx epic imports and
  re-exports them with full definitions, replacing the stubs

**Dependencies:** React only (no MUI, no yaml)

**Expected tests:** None in this epic — the context is exercised via component tests. The pqx
epic will add dedicated context/reducer unit tests.

---

### `src/components/AppShell.tsx`

**Purpose:** Top-level layout host. Renders MUI AppBar with title and GitHub icon link.
Manages current page state (`'start' | 'editor'`) and conditionally renders `StartPage` or
`FormEditor`.

**Public API:**
```typescript
export function AppShell(): JSX.Element;
```

**Key design points:**
```tsx
// Page routing — no router library
type Page = 'start' | 'editor';
const [currentPage, setCurrentPage] = useState<Page>('start');

// AppBar with GitHub link
<AppBar position="static">
  <Toolbar>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>Autoinstall Generator</Typography>
    <IconButton
      component="a"
      href="https://github.com/..."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View source on GitHub"
      color="inherit"
    >
      <GitHubIcon />
    </IconButton>
  </Toolbar>
</AppBar>

// Conditional page render
{currentPage === 'start'
  ? <StartPage onStart={() => setCurrentPage('editor')} />
  : <FormEditor />
}
```

**Dependencies:** React, MUI (AppBar, Toolbar, Typography, IconButton), @mui/icons-material (GitHub)

**Expected test count:** 4 tests
- Renders AppBar with title
- Renders GitHub icon link with correct aria-label
- Renders StartPage on initial load
- Navigates to FormEditor when Start button is clicked
- Zero axe-core violations (jest-axe)

---

### `src/components/StartPage.tsx`

**Purpose:** Landing page. Renders brief introductory text and a "New Project" button that
triggers navigation to FormEditor.

**Public API:**
```typescript
interface StartPageProps {
  onStart: () => void;
}
export function StartPage({ onStart }: StartPageProps): JSX.Element;
```

**Key design points:**
```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 3 }}>
  <Typography variant="h4">Autoinstall Generator</Typography>
  <Typography variant="body1" align="center" sx={{ maxWidth: 600 }}>
    Create a complete Ubuntu autoinstall.yaml via structured form fields.
    All fields from the Canonical Autoinstall specification are supported.
  </Typography>
  <Button variant="contained" size="large" onClick={onStart}>
    New Project
  </Button>
</Box>
```

**Dependencies:** React, MUI (Box, Typography, Button)

**Expected test count:** 3 tests
- Renders heading text
- Renders button
- Button click calls onStart
- Zero axe-core violations (jest-axe)

---

### `src/components/FormEditor.tsx`

**Purpose:** Main workspace. Renders the two-column responsive layout shell:
left column (60%) for form sections, right column (40%) for YAML preview. Both sides are
placeholders in this epic; downstream epics populate them.

**Public API:**
```typescript
export function FormEditor(): JSX.Element;
```

**Key design points:**
```tsx
<Box sx={{ p: 2 }}>
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: 2,
      alignItems: 'flex-start',
    }}
  >
    {/* Left: form sections — 60% on desktop */}
    <Box sx={{ flex: { md: '0 0 60%' }, width: { xs: '100%', md: 'auto' } }}>
      {/* FormNavigation + FormContent — populated by autoinstall-generator-dez */}
      <Typography variant="body2" color="text.secondary">
        Form sections loading…
      </Typography>
    </Box>

    {/* Right: YAML preview — 40% on desktop */}
    <Box sx={{ flex: { md: '0 0 40%' }, width: { xs: '100%', md: 'auto' } }}>
      {/* YamlPreviewPanel — populated by autoinstall-generator-zfe */}
      <Typography variant="body2" color="text.secondary">
        YAML preview loading…
      </Typography>
    </Box>
  </Box>
</Box>
```

**Dependencies:** React, MUI (Box, Typography)

**Expected test count:** 4 tests
- Renders without crashing
- Renders form placeholder section
- Renders YAML preview placeholder section
- Zero axe-core violations (jest-axe)

> Note: Breakpoint-driven layout changes cannot be directly tested in jsdom (no real CSS layout
> engine). The responsive behavior is verified by inspecting sx prop values in snapshot tests and
> by a manual smoke check in the browser.

---

### `src/components/ErrorBoundary.tsx`

**Purpose:** React class component that catches unexpected runtime errors and renders a
user-friendly fallback instead of a blank screen.

**Public API:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;  // optional custom fallback
}
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState>;
```

**Key design points:**
```tsx
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Production: replace with proper logging (Sentry etc.) in v2
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5">Something went wrong</Typography>
          <Typography variant="body1">
            Please reload the page. If the problem persists, please open an issue.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}
```

**Dependencies:** React, MUI (Box, Typography)

**Expected test count:** 3 tests
- Renders children when no error
- Renders default fallback when child throws
- Renders custom fallback when provided

---

### `src/App.tsx` (modified)

**Purpose:** Root component. Wraps the entire tree with `AutoinstallConfigProvider` and
`ErrorBoundary`, then renders `AppShell`.

**Updated implementation sketch:**
```tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/AppShell';
import { AutoinstallConfigProvider } from './context/AutoinstallConfigContext';

export default function App() {
  return (
    <ErrorBoundary>
      <AutoinstallConfigProvider>
        <AppShell />
      </AutoinstallConfigProvider>
    </ErrorBoundary>
  );
}
```

**Expected test count (updates to App.test.tsx):** 3 tests
- Renders without crashing (existing — now renders AppShell)
- Shows StartPage on initial render
- Has no axe-core violations (existing — kept)

---

## Test Strategy

### Coverage Target

**>90% aggregate** for all new code in this epic (lines + branches).

Coverage is enforced via `@vitest/coverage-v8`. The threshold is checked in CI.

### Test Counts Per Module

| Module | Unit Tests | Notes |
|--------|-----------|-------|
| `App.tsx` | 3 | Updated existing tests |
| `AppShell.tsx` | 5 | AppBar title, GitHub link, initial page, navigation, axe |
| `StartPage.tsx` | 4 | Heading, button presence, click handler, axe |
| `FormEditor.tsx` | 4 | Render, form placeholder, YAML placeholder, axe |
| `ErrorBoundary.tsx` | 3 | Children render, default fallback, custom fallback |
| `AutoinstallConfigContext.tsx` | 2 | Hook throws outside Provider, hook returns value inside |
| **Total** | **21** | |

### Mock Patterns

| Mock Target | Strategy | Reason |
|-------------|----------|--------|
| `AutoinstallConfigContext` | No mock — use real Provider in all component tests | Context is a stub; real Provider is simpler than mocking |
| `ErrorBoundary` children that throw | `ThrowingComponent` test helper that throws in render | Standard pattern for error boundary testing |
| `window.open` / GitHub link | No mock needed — `href` tested via `getByRole` + `toHaveAttribute` | Not testing navigation, testing rendered attribute |

### Fixture Table

| Fixture | Used By | Description |
|---------|---------|-------------|
| `<AutoinstallConfigProvider>` + `<AppShell />` | AppShell tests | Full shell integration fixture |
| `<StartPage onStart={vi.fn()} />` | StartPage tests | Isolated StartPage with spy |
| `<FormEditor />` wrapped in Provider | FormEditor tests | FormEditor with context |
| `<ErrorBoundary><ThrowingComponent /></ErrorBoundary>` | ErrorBoundary tests | Error scenario |

### Accessibility Verification

Each component test file includes an `it('has no axe-core violations', ...)` test:

```typescript
import { axe } from 'jest-axe';

it('has no axe-core violations', async () => {
  const { container } = render(<StartPage onStart={() => {}} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

This maps directly to the epic AC: "Zero axe-core critical violations (jest-axe)".

### Acceptance Criteria → Test Mapping

| Epic Acceptance Criterion | Verified By |
|--------------------------|-------------|
| AppBar renders application title and GitHub link | `AppShell.test.tsx`: title text check, GitHub icon link `aria-label` |
| StartPage renders and navigates to FormEditor | `AppShell.test.tsx`: initial StartPage visible, click navigates |
| Two-column layout renders on desktop, stacked on mobile | `FormEditor.test.tsx`: sx prop snapshot for `flexDirection` value |
| Error boundary catches and displays fallback | `ErrorBoundary.test.tsx`: ThrowingComponent renders fallback |
| Zero axe-core critical violations | All `*.test.tsx` files: `axe()` assertion |

---

## Forward Compatibility

This epic creates the integration points that downstream epics will use:

| Downstream Epic | Readiness | Integration Point |
|----------------|-----------|------------------|
| autoinstall-generator-pqx (Core State) | **Ready to proceed in parallel** | Replaces context stub internals; `useAutoinstallConfig()` hook API is stable |
| autoinstall-generator-dez (Form Navigation) | **Unblocked after this epic** | Renders inside `FormEditor`'s left column placeholder |
| autoinstall-generator-zfe (YAML Preview) | **Unblocked after this epic** | Renders inside `FormEditor`'s right column placeholder |
| autoinstall-generator-ejs (YAML Escape Hatch) | Blocked on pqx | Uses `useAutoinstallConfig()` dispatch — hook API stable |
| autoinstall-generator-gni/mb1/wxk/7y4 (Form Sections) | Blocked on dez + pqx | Rendered inside FormEditor's left column via FormContent |

**API stability commitments:**
- `useAutoinstallConfig()` signature must not change (downstream epics consume it)
- `FormEditor` must preserve the left/right column DOM structure (downstream epics inject into it)
- `AppShell` page routing interface (`'start' | 'editor'`) is internal; downstream epics do not depend on it

---

## Dependency Changes

No new production or dev dependencies required. All needed packages are already declared:
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` (MUI 6)
- `react`, `react-dom` (React 18)
- `jest-axe`, `@testing-library/react`, `@testing-library/jest-dom` (testing)

---

## Verification

| Acceptance Criterion | Evidence |
|---------------------|---------|
| AppBar renders application title and GitHub link | `AppShell.test.tsx` passes; `getByRole('link', { name: /github/i })` succeeds |
| StartPage renders and navigates to FormEditor | `AppShell.test.tsx` passes; userEvent click shows FormEditor |
| Two-column layout renders on desktop, stacked on mobile | `FormEditor.test.tsx` passes; sx snapshot includes `{ xs: 'column', md: 'row' }` |
| Error boundary catches and displays fallback | `ErrorBoundary.test.tsx` passes; fallback text rendered after throw |
| Zero axe-core critical violations | All component test files pass `axe()` assertions |
| Test coverage ≥ 90% | `vitest --coverage` output shows ≥ 90% lines/branches for new files |

---

## Key References

| Document | Path | Relevance |
|----------|------|-----------|
| Building Block View (Level 1) | `docs/arc42/05-building-block-view.md` | App, AppShell, StartPage, FormEditor structure |
| Crosscutting Concepts | `docs/arc42/08-crosscutting-concepts.md` | Layout, error handling, accessibility, state management patterns |
| ADR-005: Technology Stack | `SourceDocuments/adr/005-technology-stack-rationale.md` | React 18, MUI 6, Context+Reducer confirmed |
| ADR-002: Build Tooling | `SourceDocuments/adr/002-build-tooling-and-deployment.md` | Vitest, jest-axe CI gate |
| ADR-004: Form Navigation | `SourceDocuments/adr/004-form-navigation-tabs.md` | Tabs/Accordion (layout shell only in this epic) |
| SPEC.md §Layout | `SPEC.md` | Two-column 60/40, responsive |
| SPEC.md §Navigation | `SPEC.md` | MUI AppBar, title, GitHub link |
| Existing App.tsx | `src/App.tsx` | Stub being replaced |
| Existing App.test.tsx | `src/App.test.tsx` | Tests being updated |
| Project Setup Plan | `planning/autoinstall-generator-6yq/implementation-plan.md` | Build infrastructure reference |
