# Project Setup & Build Infrastructure — Issue Breakdown

> **Epic:** autoinstall-generator-6yq — Project Setup & Build Infrastructure
> **Source:** `planning/autoinstall-generator-6yq/implementation-plan.md`
> **Total issues:** 5
> **Estimated tests:** ~2 (smoke tests in this epic; test infrastructure enables >90% coverage in all downstream epics)

---

## ISSUE-1: Initialize Vite + React scaffold and install all dependencies

**Type:** task | **Priority:** P0 | **Effort:** S

**Description:**
Create the bare-bones Vite + React 18 + TypeScript project scaffold for the Autoinstall
Generator SPA. This is the foundational step — no other issue can begin until the project
structure and all npm dependencies are in place. Use `npm create vite@latest` with the
`react-ts` template as a starting point, then clean all template boilerplate (remove
`src/App.css`, `src/index.css`, `assets/react.svg`) and replace `src/App.tsx` with a
minimal placeholder.

All production and development dependencies must be declared in `package.json` and
installed. The stub app only needs to render visible content — no MUI or context is wired
in yet.

**Files created:**
- `package.json` — all prod + dev dependencies and npm scripts
- `index.html` — SPA entry HTML (`<div id="root">`)
- `src/main.tsx` — React entry point (`createRoot` + `StrictMode`)
- `src/App.tsx` — minimal stub (`<div>Autoinstall Generator — setup complete</div>`)
- `src/vite-env.d.ts` — Vite client type reference
- `public/` — static assets directory (Vite convention)

**Dependencies installed (production):**
`react ^18`, `react-dom ^18`, `@mui/material ^6`, `@mui/icons-material ^6`,
`@emotion/react ^11`, `@emotion/styled ^11`, `react-hook-form ^7`,
`@hookform/resolvers ^3`, `zod ^3`, `yaml ^2`, `react-syntax-highlighter ^15`

**Dependencies installed (dev):**
`vite ^6`, `@vitejs/plugin-react ^4`, `typescript ^5`, `@types/react ^18`,
`@types/react-dom ^18`, `@types/react-syntax-highlighter ^15`, `vitest ^2`,
`@vitest/coverage-v8 ^2`, `jsdom ^25`, `@testing-library/react ^16`,
`@testing-library/user-event ^14`, `@testing-library/jest-dom ^6`, `jest-axe ^9`,
`@types/jest-axe ^3`, `eslint ^9`, `@eslint/js ^9`, `typescript-eslint ^8`,
`eslint-plugin-react ^7`, `eslint-plugin-react-hooks ^5`,
`eslint-plugin-react-refresh ^0.4`, `rollup-plugin-visualizer ^5`

**npm scripts declared:**

| Script | Command |
|--------|---------|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `preview` | `vite preview` |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `lint` | `eslint .` |
| `type-check` | `tsc --noEmit` |
| `analyze` | `vite build --report` |

**Acceptance Criteria:**
- [ ] `package.json` declares all production and dev dependencies listed above
- [ ] `npm install` completes without errors; `node_modules/` is populated
- [ ] `index.html` at repo root contains `<div id="root">` (Vite SPA convention)
- [ ] `src/main.tsx` bootstraps React with `createRoot` and wraps app in `StrictMode`
- [ ] `src/App.tsx` renders `<div>Autoinstall Generator — setup complete</div>` and exports default
- [ ] `src/vite-env.d.ts` contains the `/// <reference types="vite/client" />` directive
- [ ] Template boilerplate is absent: `src/App.css`, `src/index.css`, and `assets/react.svg` do NOT exist
- [ ] `npm run dev` starts the Vite dev server at `localhost:5173` without errors
- [ ] Browser shows the stub app content at `localhost:5173`

**Dependencies:**
- Blocks: ISSUE-2 (Vite/TS config requires deps installed)
- Blocks: ISSUE-3 (ESLint config requires deps installed)

---

## ISSUE-2: Configure Vite build config and TypeScript strict mode with path aliases

**Type:** task | **Priority:** P0 | **Effort:** M

**Description:**
Create the complete Vite and TypeScript configuration for the project. The `@/` path
alias must be defined in **both** `vite.config.ts` and `tsconfig.json` — if either is
missing, the bundler and TypeScript language server will disagree and all downstream
import statements will fail. These two configs are done together for this reason.

`vite.config.ts` also hosts the Vitest configuration block (per Decision 3 in the
implementation plan — shared config eliminates drift between test and build environments).
The coverage thresholds (90%) are configured here even though they won't fail until real
tests exist.

The `rollup-plugin-visualizer` is integrated to power `npm run analyze`, which generates
a `dist/stats.html` treemap used to verify the < 500 KB bundle constraint.

**Files created:**
- `vite.config.ts` — Vite build + Vitest config, `@/` alias, visualizer plugin
- `tsconfig.json` — root config that references `tsconfig.app.json` + `tsconfig.node.json`
- `tsconfig.app.json` — strict TypeScript config for application source
- `tsconfig.node.json` — Node.js-side TS config (for `vite.config.ts` itself)

**Acceptance Criteria:**
- [ ] `vite.config.ts` configures `@vitejs/plugin-react` as a plugin
- [ ] `@/` alias resolves to `path.resolve(__dirname, './src')` in `vite.config.ts` under `resolve.alias`
- [ ] `rollup-plugin-visualizer` is integrated; `npm run analyze` generates `dist/stats.html` without errors
- [ ] Vitest block in `vite.config.ts` sets `globals: true`, `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`
- [ ] Vitest coverage thresholds: 90% lines, functions, branches, and statements (`provider: 'v8'`, `reporter: ['text', 'lcov']`)
- [ ] `tsconfig.json` uses `"references"` to reference both `tsconfig.app.json` and `tsconfig.node.json`
- [ ] `tsconfig.app.json` includes: `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"jsx": "react-jsx"`, `"paths": { "@/*": ["./src/*"] }`
- [ ] `tsconfig.node.json` is configured for Vite's Node.js context (covers `vite.config.ts` compilation)
- [ ] `npm run build` produces a `dist/` directory without TypeScript or bundling errors
- [ ] `npm run type-check` (`tsc --noEmit`) passes with zero TypeScript errors
- [ ] `npm run preview` serves `dist/` locally without error

**Dependencies:**
- Blocked by: ISSUE-1 (npm dependencies must be installed)
- Blocks: ISSUE-4 (Vitest env is in vite.config.ts; test setup depends on jsdom being configured)

---

## ISSUE-3: Configure ESLint flat config

**Type:** task | **Priority:** P0 | **Effort:** S

**Description:**
Create the ESLint configuration using the modern flat config format (`eslint.config.js`).
This is independent of the Vite and TypeScript configuration — it only requires npm
dependencies to be installed. Configuring ESLint separately allows two developers to
work Issues 2 and 3 in parallel.

The configuration must enforce:
- `@typescript-eslint` rules for type safety in `.ts`/`.tsx` files
- `eslint-plugin-react-hooks` for Rules of Hooks (critical for a codebase using `useContext`, `useEffect`, `useCallback`)
- `eslint-plugin-react-refresh` for HMR safety (Vite template default)

`@typescript-eslint/no-explicit-any` is set to `'warn'` not `'error'` because the data
model uses intentional `any` escape hatches for the `network` and `storage` fields (raw
Netplan/Autoinstall YAML blobs that are structurally unbounded).

**Files created:**
- `eslint.config.js` — ESLint flat config

**Acceptance Criteria:**
- [ ] `eslint.config.js` uses the flat config API (`export default tseslint.config(...)`)
- [ ] `@eslint/js` recommended rules are enabled
- [ ] `typescript-eslint` recommended rules are enabled for `**/*.{ts,tsx}` files
- [ ] `eslint-plugin-react-hooks` `recommended.rules` are spread into the rules object
- [ ] `eslint-plugin-react-refresh` is integrated with `'only-export-components': ['warn', { allowConstantExport: true }]`
- [ ] `dist/` is excluded from linting via the `ignores` array
- [ ] `@typescript-eslint/no-explicit-any` is set to `'warn'` (not `'error'`)
- [ ] `npm run lint` exits with code 0 and reports zero errors on the stub codebase
- [ ] Manually adding a hook call inside a conditional block in any `.tsx` file causes `npm run lint` to report an error (verifies `react-hooks/rules-of-hooks` is active)

**Dependencies:**
- Blocked by: ISSUE-1 (ESLint plugins must be installed)
- Blocks: ISSUE-4 (smoke test must pass `npm run lint`)

---

## ISSUE-4: Configure Vitest test environment and write smoke tests

**Type:** task | **Priority:** P0 | **Effort:** M

**Description:**
Set up the global Vitest test environment and write the two smoke tests for `App.tsx`.
This issue depends on ISSUE-2 (the Vitest jsdom environment is configured in
`vite.config.ts`) and ISSUE-3 (the test files must pass linting).

`src/test/setup.ts` is the global setup file that runs before every test file. It:
1. Extends Vitest matchers with `@testing-library/jest-dom`
2. Registers `jest-axe`'s `toHaveNoViolations` globally so downstream tests can call `expect(results).toHaveNoViolations()` without per-file imports
3. Stubs `ResizeObserver` (not implemented in jsdom; required by MUI 6)
4. Stubs `window.matchMedia` (not implemented in jsdom; required by MUI responsive breakpoints)

This infrastructure is the foundation for all downstream test files — getting it right
here prevents repeated per-file stub setup across the 20+ component tests that come in
later epics.

**Files created:**
- `src/test/setup.ts` — global Vitest setup (jest-dom, jest-axe, jsdom stubs)
- `src/App.test.tsx` — smoke tests for App component (render + axe-core)

**Acceptance Criteria:**
- [ ] `src/test/setup.ts` imports `'@testing-library/jest-dom'`
- [ ] `src/test/setup.ts` calls `expect.extend(toHaveNoViolations)` using `jest-axe`'s `toHaveNoViolations`
- [ ] `src/test/setup.ts` stubs `global.ResizeObserver` with a class implementing `observe()`, `unobserve()`, `disconnect()`
- [ ] `src/test/setup.ts` stubs `window.matchMedia` via `Object.defineProperty` returning an object with `matches: false` and all listener methods as no-ops
- [ ] `src/App.test.tsx` contains a `describe('App', ...)` block with exactly 2 tests
- [ ] Test `'renders without crashing'`: renders `<App />` and asserts `container` is in the document
- [ ] Test `'has no axe-core violations'`: renders `<App />`, runs `axe(container)`, asserts `expect(results).toHaveNoViolations()`
- [ ] `npm run test` exits with code 0; output shows "2 passed"
- [ ] `npm run test` coverage report shows ≥ 90% line coverage for `src/App.tsx`
- [ ] `npm run lint` exits with code 0 on both `src/test/setup.ts` and `src/App.test.tsx`

**Dependencies:**
- Blocked by: ISSUE-2 (Vitest jsdom environment and `setupFiles` must be configured)
- Blocked by: ISSUE-3 (test files must pass ESLint)
- Blocks: ISSUE-5 (all local quality gates must pass before CI/CD is set up)

---

## ISSUE-5: Set up GitHub Actions CI/CD pipeline and GitHub Pages deployment

**Type:** task | **Priority:** P0 | **Effort:** M

**Description:**
Create the GitHub Actions CI/CD pipeline that runs lint → type-check → test → build
on every push and PR, and deploys to GitHub Pages on push to `main`. This is the
terminal issue for the epic — it is the last piece and requires all local quality gates
to be passing before it can be validated.

The pipeline uses two jobs (per Decision 5 in the implementation plan):
1. `ci` — runs on all push/PR events; validates code quality and builds the bundle
2. `deploy` — runs only on push to `main`; depends on `ci`; deploys to GitHub Pages

Using `npm ci` (not `npm install`) ensures reproducible installs from the lockfile.
The `concurrency` setting prevents overlapping Pages deployments.

**Note:** GitHub Pages must be enabled in repository Settings → Pages → Source: GitHub
Actions before the `deploy` job will succeed. This is a one-time manual step by the
repository owner, outside the scope of the CI configuration itself.

**Files created:**
- `.github/workflows/ci.yml` — GitHub Actions CI + deploy pipeline

**Acceptance Criteria:**
- [ ] `.github/workflows/ci.yml` declares two jobs: `ci` and `deploy`
- [ ] `ci` job has `on: push: branches: [main]` and `on: pull_request: branches: [main]` triggers
- [ ] `ci` job steps run in this exact order: `actions/checkout@v4` → `actions/setup-node@v4` (Node 20, `cache: 'npm'`) → `npm ci` → `npm run lint` → `npm run type-check` → `npm run test` → `npm run build`
- [ ] A step named "Report bundle sizes" runs `ls -lh dist/assets/*.js | sort -k5 -hr` after `npm run build`
- [ ] `actions/upload-pages-artifact@v3` step has `if: github.ref == 'refs/heads/main'` condition and `path: dist`
- [ ] `deploy` job has `needs: ci` and `if: github.ref == 'refs/heads/main'` conditions
- [ ] `deploy` job uses `actions/deploy-pages@v4` in its steps
- [ ] Workflow-level `permissions` block grants `contents: read`, `pages: write`, `id-token: write`
- [ ] Workflow-level `concurrency: { group: pages, cancel-in-progress: false }` is set
- [ ] `npm ci` is used in the `ci` job (not `npm install`)
- [ ] On push to `main` with GitHub Pages enabled: `ci` job turns green (all 4 steps pass)
- [ ] On push to `main` with GitHub Pages enabled: `deploy` job succeeds; GitHub Pages URL renders the stub app
- [ ] CI "Report bundle sizes" output shows total `dist/assets/*.js` gzipped size < 500 KB

**Dependencies:**
- Blocked by: ISSUE-4 (all local quality gates — lint, type-check, test, build — must pass)
- Blocks: autoinstall-generator-jah (Application Shell) via epic completion
- Blocks: autoinstall-generator-pqx (Core State Management) via epic completion

---

## Dependency Map

### Critical Path

The longest dependency chain — nothing can parallelize around this:

```
ISSUE-1 (scaffold)
    │
    ├──→ ISSUE-2 (Vite/TS config) ──┐
    │                                ├──→ ISSUE-4 (Vitest + smoke tests) ──→ ISSUE-5 (CI/CD)
    └──→ ISSUE-3 (ESLint) ──────────┘
```

**Minimum sequential steps for a solo developer:** 4 (1 → 2 → 4 → 5, with 3 interleaved between 1 and 4)

### Parallel Work Opportunities

| Phase | Issues | Can run in parallel? |
|-------|--------|---------------------|
| Phase 1 | ISSUE-1 | Solo — no parallelism |
| Phase 2 | ISSUE-2, ISSUE-3 | **Yes** — independent after ISSUE-1 |
| Phase 3 | ISSUE-4 | Solo — requires both ISSUE-2 and ISSUE-3 |
| Phase 4 | ISSUE-5 | Solo — requires ISSUE-4 |

### Cross-Epic Dependencies

| Dependency | Type | Status | Impact |
|-----------|------|--------|--------|
| autoinstall-generator-6yq → autoinstall-generator-jah | **Hard** | jah is blocked until 6yq closes | Application Shell cannot begin without the Vite scaffold and TS config |
| autoinstall-generator-6yq → autoinstall-generator-pqx | **Hard** | pqx is blocked until 6yq closes | State Management cannot begin without the Zod/RHF/yaml packages installed |

### Infrastructure Loose Gates

None. This epic **is** the infrastructure. There are no external deployment or
environment dependencies gating development of these issues.
