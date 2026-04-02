# Implementation Plan: autoinstall-generator-6yq
# Project Setup & Build Infrastructure

**Epic:** autoinstall-generator-6yq
**Priority:** P0
**Status:** Open
**Generated:** 2026-04-02

---

## Context

### Problem Statement

The Autoinstall Generator SPA has a complete architecture (arc42, ADRs) and a full issue backlog, but **no source code exists yet**. All downstream issues (Application Shell, Core State Management, Form Sections, YAML Preview, Testing) block on this epic because there is no project scaffold, no build system, no CI pipeline, and no deployment target.

Without this epic, no code can be written, reviewed, or deployed.

### Desired Outcome

A functioning React + TypeScript SPA project scaffold that:
- Runs locally with `npm run dev` at `localhost:5173`
- Produces a < 500 KB gzipped bundle with `npm run build`
- Passes CI on push to `main` (lint → type-check → test → build → deploy)
- Deploys automatically to GitHub Pages

### Arc42 References

| Reference | Relevance |
|-----------|-----------|
| §02 Constraints (2.1 Technical Constraints) | Mandates Vite, React 18, TypeScript, MUI 6, Vitest, ESLint, no backend |
| §07 Deployment View (7.2–7.5) | CI/CD pipeline steps, GitHub Pages mechanics, bundle size < 500 KB gzipped |
| ADR-002: Build Tooling and Deployment | Rationale for Vite over CRA, GitHub Actions pipeline shape, Vitest as natural companion |
| ADR-005: Technology Stack Rationale | All 6 technology choices with rationale |
| §08 Crosscutting Concepts — Development Experience | Vite HMR, Vitest config sharing, TypeScript strict mode, ESLint rule set |

---

## Scope

### In Scope (Acceptance Criteria)

1. `npm run dev` starts the Vite dev server at `localhost:5173`
2. `npm run build` produces `dist/` within 500 KB gzipped JS
3. CI pipeline (lint → type-check → test → build → deploy) runs and passes on push to `main`
4. GitHub Pages deployment works

### Out of Scope

- Application logic, React components, form sections, state management — these belong to child issues (autoinstall-generator-jah, autoinstall-generator-pqx, etc.)
- Any backend or server-side code
- License file (noted as TODO in §02.4 — not part of this epic)
- Staging environment / PR preview deployments (noted as technical debt in §11)

---

## Architecture Constraints

| Constraint | Specification | Source |
|-----------|---------------|--------|
| Build tool | Vite (not CRA, not webpack) | ADR-002, §02.1 |
| Language | TypeScript with strict mode | §02.1 |
| Framework | React 18+ | §02.1 |
| UI library | MUI 6 | §02.1 |
| Test runner | Vitest | ADR-002 |
| Test libraries | @testing-library/react, jest-axe | ADR-002, §02.3 |
| Lint | ESLint with React + TypeScript ruleset | §08 Development Experience |
| CI/CD | GitHub Actions, pipeline order: lint → type-check → test → build → deploy | §07.3 |
| Hosting | GitHub Pages via actions/deploy-pages | ADR-002, §07.5 |
| Bundle target | < 500 KB gzipped total JS | §07.4, Q-10 |
| No backend | Pure SPA, no API, no server | §02.1 |
| Browser target | Evergreen browsers (last 2 major versions) | §02.2 |
| Dev server | localhost:5173 (Vite default) | §07.2 |
| No env vars | No runtime environment variables | §02.1 |

---

## Key Design Decisions

### Decision 1: Vite Template and TypeScript Configuration

**Decision:** Use the official `npm create vite@latest` scaffold with `react-ts` template, then enable TypeScript strict mode in `tsconfig.json`.

**Rationale:** The `react-ts` template provides a battle-tested starting point (proper `tsconfig.json`, Vite config, `index.html`) without manual wiring. Strict mode is required by §02.1 and catches errors that would surface at runtime.

**Tradeoff:** Template-generated boilerplate files (e.g., `App.css`, `assets/react.svg`) will be deleted in the same commit — the scaffold should be clean from the start.

---

### Decision 2: ESLint Configuration

**Decision:** Use the flat config format (`eslint.config.js`) with:
- `@eslint/js` recommended rules
- `eslint-plugin-react` with `jsx-runtime` settings (React 17+ JSX transform — no `import React` needed)
- `eslint-plugin-react-hooks` (enforces Rules of Hooks)
- `typescript-eslint` for TypeScript-specific rules

**Rationale:** Vite 5/6 scaffolds using flat config by default. The `eslint-plugin-react-hooks` plugin enforces the Rules of Hooks — a critical guard for a codebase that will heavily use `useContext`, `useEffect`, `useCallback`. `typescript-eslint` enables `no-explicit-any` and other type-safety rules that align with ADR-005's TypeScript-first stance.

**Tradeoff:** Flat config is slightly more verbose to set up than legacy `.eslintrc.json`, but is the current ESLint standard and avoids deprecation warnings.

---

### Decision 3: Vitest Configuration — jsdom Environment

**Decision:** Configure Vitest to use `jsdom` as the test environment (via `@vitest/ui` or inline in `vite.config.ts`), co-located with the Vite config to share aliases and plugins.

**Rationale:** `@testing-library/react` requires a DOM environment. `jsdom` is the standard synthetic DOM for unit tests. Sharing `vite.config.ts` between the dev server and Vitest avoids drift between test and build environments — explicitly documented in §08 Development Experience.

**Tradeoff:** `jsdom` does not implement all browser APIs (e.g., `ResizeObserver`, some Clipboard API methods). Where needed, lightweight stubs will be added in `src/test/setup.ts`.

---

### Decision 4: Path Aliases

**Decision:** Configure a single `@/` path alias in `vite.config.ts` and `tsconfig.json` pointing to `src/`:

```ts
// vite.config.ts
resolve: { aliases: { '@': path.resolve(__dirname, './src') } }
// tsconfig.json compilerOptions
"paths": { "@/*": ["./src/*"] }
```

**Rationale:** All downstream issues will create components under `src/components/`, `src/context/`, `src/hooks/`, etc. Relative imports across these directories become unwieldy. A single `@/` alias is the standard Vite pattern and eliminates `../../` chain imports. Required to be set up in this epic (before any source files exist).

**Tradeoff:** None material. The alias must be defined in both Vite config and `tsconfig.json` to satisfy both the bundler and the TypeScript language server.

---

### Decision 5: GitHub Actions Pipeline Structure

**Decision:** Single workflow file `.github/workflows/ci.yml` with two jobs:
1. `ci` job: runs on all pushes and PRs — steps: `lint` → `type-check` → `test` → `build`
2. `deploy` job: runs only on push to `main`, depends on `ci` — uses `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages`

**Rationale:** Separating CI from deploy cleanly implements the §07.3 requirement that deploy runs "only on `main`; skipped on PR branches." A single `ci.yml` file is simpler to maintain than two separate workflow files. The deploy job's `if: github.ref == 'refs/heads/main'` condition ensures PRs only trigger CI but never deploy.

**Tradeoff:** GitHub Pages deployment requires repository `Settings → Pages → Source: GitHub Actions` to be enabled by the repository owner before the deploy job will succeed. This is a one-time manual step outside CI.

---

### Decision 6: Bundle Size Verification

**Decision:** Add a `npm run analyze` script using `vite-bundle-visualizer` (or `rollup-plugin-visualizer`) and run `vite build --report` as a non-blocking informational step in CI. The 500 KB gate is verified by inspecting the build output size.

**Rationale:** At project setup time, the bundle contains only React, ReactDOM, and MUI 6 (empty app). The baseline bundle size will be well under 500 KB. The constraint becomes meaningful once all dependencies are installed. `vite build` with `--report` (when using `rollup-plugin-visualizer`) generates a `stats.html` treemap. CI will print the `dist/assets/*.js` sizes with `ls -lh` so the gate can be validated.

**Tradeoff:** A hard automated size check (e.g., `bundlesize` package) adds complexity. Given this is a v1 project with a known small dependency set, manual inspection is sufficient for this epic. A hard gate can be added when the bundle approaches the limit.

---

## Project Structure

All files listed below are **NEW** (the project has no source code today).

```
autoinstall-generator/          # repository root (already exists)
├── .github/
│   └── workflows/
│       └── ci.yml              # NEW — GitHub Actions CI + deploy pipeline
├── public/
│   └── vite.svg                # NEW (Vite template default, kept or replaced)
├── src/
│   ├── main.tsx                # NEW — React entry point (ReactDOM.createRoot)
│   ├── App.tsx                 # NEW — Root component (minimal stub for P0)
│   ├── vite-env.d.ts           # NEW — Vite client type reference
│   └── test/
│       └── setup.ts            # NEW — Vitest global setup (jest-axe matchers, jsdom stubs)
├── index.html                  # NEW — SPA entry HTML (Vite convention)
├── vite.config.ts              # NEW — Vite config: plugins, path alias, Vitest config
├── tsconfig.json               # NEW — TypeScript config (strict mode, paths alias)
├── tsconfig.app.json           # NEW — App-specific TS config (Vite scaffold convention)
├── tsconfig.node.json          # NEW — Node-side TS config (for vite.config.ts itself)
├── eslint.config.js            # NEW — ESLint flat config
├── package.json                # NEW — Dependencies and scripts
└── package-lock.json           # NEW — Lockfile (generated by npm install)
```

**Not created in this epic:**
- `src/components/` — Application Shell (autoinstall-generator-jah)
- `src/context/` — State management (autoinstall-generator-pqx)
- `src/hooks/` — Custom hooks (autoinstall-generator-pqx)
- `src/schemas/` — Zod schemas (autoinstall-generator-pqx)
- Form section components — downstream issues

---

## Module Specifications

### `package.json` — Scripts and Dependencies

**Purpose:** Defines all npm scripts and declares production + dev dependencies.

**Scripts:**

| Script | Command | Notes |
|--------|---------|-------|
| `dev` | `vite` | Starts dev server at localhost:5173 |
| `build` | `tsc -b && vite build` | Type-checks then bundles |
| `preview` | `vite preview` | Serves dist/ locally |
| `test` | `vitest run` | Run tests once (CI mode) |
| `test:watch` | `vitest` | Watch mode for development |
| `lint` | `eslint .` | Lint all source files |
| `type-check` | `tsc --noEmit` | Type check without emitting |
| `analyze` | `vite build --report` | Bundle analysis (requires visualizer plugin) |

**Production dependencies:**

| Package | Version constraint | Rationale |
|---------|-------------------|-----------|
| `react` | `^18.0.0` | §02.1 constraint |
| `react-dom` | `^18.0.0` | Companion to React |
| `@mui/material` | `^6.0.0` | §02.1 constraint |
| `@mui/icons-material` | `^6.0.0` | MUI icon set used by AppBar etc. |
| `@emotion/react` | `^11.0.0` | MUI 6 peer dependency |
| `@emotion/styled` | `^11.0.0` | MUI 6 peer dependency |
| `react-hook-form` | `^7.0.0` | §02.1 constraint |
| `@hookform/resolvers` | `^3.0.0` | Zod resolver for RHF |
| `zod` | `^3.0.0` | §02.1 constraint |
| `yaml` | `^2.0.0` | §02.1 constraint — YAML 1.2 compliant |
| `react-syntax-highlighter` | `^15.0.0` | ADR-003 |

**Dev dependencies:**

| Package | Version constraint | Rationale |
|---------|-------------------|-----------|
| `vite` | `^6.0.0` | ADR-002 |
| `@vitejs/plugin-react` | `^4.0.0` | React JSX transform plugin for Vite |
| `typescript` | `^5.0.0` | §02.1 |
| `@types/react` | `^18.0.0` | TypeScript types |
| `@types/react-dom` | `^18.0.0` | TypeScript types |
| `@types/react-syntax-highlighter` | `^15.0.0` | TypeScript types |
| `vitest` | `^2.0.0` | ADR-002 |
| `@vitest/coverage-v8` | `^2.0.0` | Coverage reporting |
| `jsdom` | `^25.0.0` | DOM environment for Vitest |
| `@testing-library/react` | `^16.0.0` | Component testing utilities |
| `@testing-library/user-event` | `^14.0.0` | User interaction simulation |
| `@testing-library/jest-dom` | `^6.0.0` | Custom matchers (toBeInTheDocument, etc.) |
| `jest-axe` | `^9.0.0` | Accessibility testing (axe-core) |
| `@types/jest-axe` | `^3.0.0` | TypeScript types for jest-axe |
| `eslint` | `^9.0.0` | §08 Development Experience |
| `@eslint/js` | `^9.0.0` | ESLint recommended rules |
| `typescript-eslint` | `^8.0.0` | TypeScript ESLint integration |
| `eslint-plugin-react` | `^7.0.0` | React-specific rules |
| `eslint-plugin-react-hooks` | `^5.0.0` | Rules of Hooks enforcement |
| `eslint-plugin-react-refresh` | `^0.4.0` | Vite HMR safety (template default) |
| `rollup-plugin-visualizer` | `^5.0.0` | Bundle analysis (`npm run analyze`) |

---

### `vite.config.ts` — Build and Test Configuration

**Purpose:** Single configuration file for both the Vite dev server/build and Vitest.

**Key configuration sketch:**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: false, gzip: true, filename: 'dist/stats.html' }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
})
```

**Key design points:**
- `globals: true` enables `describe`/`it`/`expect` without imports (matches Jest API)
- `environment: 'jsdom'` required for `@testing-library/react`
- `setupFiles` runs before each test file (extends jest-axe matchers, adds jsdom stubs)
- Coverage thresholds at 90% are configured here but only enforced once tests exist
- `visualizer` plugin generates `dist/stats.html` during `vite build`

---

### `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`

**Purpose:** TypeScript configuration for the application and for Vite's Node.js context.

**Key `tsconfig.app.json` settings:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Key design points:**
- `"strict": true` — required by §02.1
- `"paths"` must mirror `vite.config.ts` resolve aliases
- `"jsx": "react-jsx"` — React 17+ JSX transform (no `import React` required in components)
- `"noUnusedLocals"` and `"noUnusedParameters"` — enforces clean code in the codebase

---

### `eslint.config.js` — Linting Rules

**Purpose:** Define the ESLint ruleset for the project.

**Key configuration sketch:**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)
```

**Key design points:**
- `@typescript-eslint/no-explicit-any: 'warn'` — the data model has intentional `any` fields (network, storage escape hatches); warn not error so the escape-hatch patterns can be used consciously
- `react-hooks` rules enforce Rules of Hooks — critical for the Context+Reducer pattern
- `dist` is ignored — no linting of build output

---

### `src/test/setup.ts` — Vitest Global Setup

**Purpose:** Configure jest-axe matchers and stub unavailable jsdom APIs before each test file.

**Key setup sketch:**

```ts
import '@testing-library/jest-dom'
import { configureAxe, toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

expect.extend(toHaveNoViolations)

// Stub ResizeObserver (not implemented in jsdom; required by MUI)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Stub matchMedia (not implemented in jsdom; required by MUI responsive breakpoints)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
```

**Key design points:**
- `toHaveNoViolations` is registered globally so all test files can call `expect(results).toHaveNoViolations()` without re-importing
- `ResizeObserver` stub is required by MUI 6 — throws in jsdom without it
- `matchMedia` stub is required for MUI responsive breakpoint hooks

---

### `src/main.tsx` — Application Entry Point

**Purpose:** Bootstrap React into the DOM. Minimal stub — full App component comes in autoinstall-generator-jah.

**Key sketch:**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Key design points:**
- `StrictMode` is enabled — double-renders components in development to detect side effects
- `document.getElementById('root')!` — non-null assertion is safe; `index.html` always has `<div id="root">`

---

### `src/App.tsx` — Root Component (Minimal Stub)

**Purpose:** Minimal placeholder that renders something visible so `npm run dev` and `npm run build` both succeed. Full implementation in autoinstall-generator-jah.

**Key sketch:**

```tsx
function App() {
  return <div>Autoinstall Generator — setup complete</div>
}

export default App
```

**Key design points:**
- No dependencies on MUI or state yet — those come in child epics
- The stub must render without errors so CI's `vite build` passes

---

### `.github/workflows/ci.yml` — CI/CD Pipeline

**Purpose:** Implement the lint → type-check → test → build → deploy pipeline from §07.3.

**Key YAML sketch:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint          # Step 1: ESLint
      - run: npm run type-check    # Step 2: tsc --noEmit
      - run: npm run test          # Step 3: Vitest
      - run: npm run build         # Step 4: vite build
      - name: Report bundle sizes
        run: ls -lh dist/assets/*.js | sort -k5 -hr
      - uses: actions/upload-pages-artifact@v3
        if: github.ref == 'refs/heads/main'
        with:
          path: dist

  deploy:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Key design points:**
- `npm ci` (not `npm install`) — reproducible installs using lockfile
- `actions/upload-pages-artifact` is conditional on `main` branch — avoids trying to upload from PRs
- `deploy` job is separate with `needs: ci` and its own `if` condition — matches §07.3 separation
- `concurrency: group: pages` prevents overlapping deployments
- `permissions` block is required by `actions/deploy-pages` (write to Pages)
- Node.js 20 LTS — stable for Vite 6 and the npm packages listed

---

## Test Strategy

### Coverage Target

**>90% aggregate** for all new code in this epic.

> Note: This epic creates very little testable source code (mainly `main.tsx`, `App.tsx`, `setup.ts`). The primary "test" of this epic is that the CI pipeline itself runs successfully. Test infrastructure created here enables >90% coverage in all downstream epics.

### Tests in This Epic

| Test File | What It Tests | Type |
|-----------|--------------|------|
| `src/App.test.tsx` | App renders without crashing; zero axe-core violations | Unit + a11y |
| CI pipeline run | lint, type-check, test, build all pass | Integration (CI) |

**`src/App.test.tsx` sketch:**

```tsx
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('has no axe-core violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Test Infrastructure for Downstream Epics

The setup in this epic enables the following patterns (documented for downstream implementors):

| Pattern | Provided by | Used in |
|---------|------------|---------|
| `render()` from `@testing-library/react` | Installed in this epic | All form section tests |
| `userEvent.setup()` | `@testing-library/user-event` | Interaction tests |
| `axe(container)` + `toHaveNoViolations()` | `jest-axe` + `setup.ts` | Every component's a11y test |
| `ResizeObserver` stub | `setup.ts` | All MUI component tests |
| `matchMedia` stub | `setup.ts` | All MUI responsive tests |
| `@/` path alias | `vite.config.ts` + `tsconfig.json` | All import statements |
| Coverage at 90% | `vite.config.ts` coverage thresholds | Enforced from first real test |

### Quality Gates

Before closing this epic, all of the following must pass:

- [ ] `npm run lint` — zero ESLint errors
- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run test` — all tests pass, including axe-core
- [ ] `npm run build` — dist/ produced, no TypeScript or build errors
- [ ] `dist/assets/*.js` total gzipped size < 500 KB (verified with `ls -lh` output in CI)
- [ ] GitHub Actions CI workflow green on push to `main`
- [ ] GitHub Pages deployment succeeds and renders the stub app

---

## Forward Compatibility

The decisions made in this epic directly shape all downstream epics.

| Downstream Epic | Readiness | Integration Point |
|----------------|-----------|------------------|
| autoinstall-generator-jah (Application Shell & Layout) | Unblocked after this epic closes | Implements `App.tsx`, adds `AppShell`, `StartPage`, `FormEditor` stubs; uses `@/` alias; follows MUI import patterns |
| autoinstall-generator-pqx (Core State Management) | Unblocked after this epic closes | Creates `src/context/`, `src/hooks/`, `src/schemas/`; Zod + RHF installed here; tests use `setup.ts` stubs |
| autoinstall-generator-vw6 (Testing, Accessibility & Quality Gates) | Unblocked after jah and pqx close | Extends the test infrastructure: 90% coverage gate, jest-axe patterns established here |
| Form section epics (dez, ejs, 7y4, gni, mb1, wxk, zfe) | Blocked on jah + pqx | Consume the `@/` alias, MUI components, RHF + Zod resolver patterns established here |

**Integration points that must be correct now:**

1. **`@/` alias** — must be in both `vite.config.ts` and `tsconfig.json` or TypeScript language server will show errors in all downstream code
2. **`setup.ts` stubs** — `ResizeObserver` and `matchMedia` must be stubbed before any MUI tests are written
3. **`jest-axe` global registration** — `toHaveNoViolations` must be in `setup.ts` so downstream a11y tests work without per-file setup
4. **`globals: true` in Vitest** — all test files expect `describe`/`it`/`expect` without imports
5. **Coverage thresholds** — set at 90% now; coverage reports will run but not fail until real code exists

---

## Dependency Changes

All dependencies are new (no existing `package.json`). See "Module Specifications — `package.json`" section above for the complete dependency table.

**No existing dependencies to update or remove.**

---

## Verification

Mapping each acceptance criterion to evidence:

| Acceptance Criterion | Test / Evidence |
|---------------------|----------------|
| `npm run dev` starts Vite dev server at localhost:5173 | Manual verification during development; `vite` script in `package.json` |
| `npm run build` produces `dist/` within 500 KB gzipped JS | CI step "Report bundle sizes" prints `ls -lh dist/assets/*.js`; verified visually on first run |
| CI pipeline runs and passes on push to `main` | GitHub Actions run green; all 4 steps (lint, type-check, test, build) pass |
| GitHub Pages deployment works | `actions/deploy-pages` step succeeds; URL resolves and renders the stub app |

---

## Key References

| Document | Path | Relevance |
|---------|------|-----------|
| Arc42 §02 Constraints | `docs/arc42/02-constraints.md` | All technical and browser constraints |
| Arc42 §07 Deployment View | `docs/arc42/07-deployment-view.md` | CI pipeline structure, GitHub Pages mechanics |
| Arc42 §08 Crosscutting Concepts | `docs/arc42/08-crosscutting-concepts.md` | Development experience, ESLint, Vitest config sharing |
| Arc42 §09 Architecture Decisions | `docs/arc42/09-architecture-decisions.md` | ADR-002 (Vite, GitHub Pages), ADR-005 (tech stack) |
| ADR-002 | `SourceDocuments/adr/002-build-tooling-and-deployment.md` | Definitive rationale for Vite and GitHub Actions |
| ADR-005 | `SourceDocuments/adr/005-technology-stack-rationale.md` | Definitive rationale for all 6 tech choices |
| SPEC.md | `SPEC.md` | Original specification (German); source of all field definitions |
| Vite Docs | https://vitejs.dev/guide/ | Reference for `vite.config.ts` options |
| GitHub Pages + Actions | https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site | Deployment mechanics |

---

## Implementation Sequence

For a developer picking up this epic:

1. **Initialize project scaffold**
   - `npm create vite@latest . -- --template react-ts` (or create files manually)
   - Delete template boilerplate: `src/App.css`, `src/index.css`, `assets/react.svg`, `public/vite.svg` (or keep `public/` placeholder)
   - Clean `src/App.tsx` to minimal stub

2. **Install all dependencies** — run `npm install` with the full dependency list

3. **Configure `vite.config.ts`** — add path alias, Vitest config, visualizer plugin

4. **Configure TypeScript** — enable strict mode, add `paths` alias in `tsconfig.app.json`

5. **Configure ESLint** — create `eslint.config.js` with flat config

6. **Create test setup** — `src/test/setup.ts` with jest-axe, ResizeObserver, matchMedia stubs

7. **Write the smoke test** — `src/App.test.tsx`

8. **Verify locally** — `npm run dev`, `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`

9. **Create GitHub Actions workflow** — `.github/workflows/ci.yml`

10. **Push to `main`** — verify CI green and Pages deployment succeeds

11. **Close epic** — all acceptance criteria verified
