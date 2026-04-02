# Project Setup & Build Infrastructure: Implementation Sequence

> **Epic:** autoinstall-generator-6yq — Project Setup & Build Infrastructure
> **Issues:** 5 (see `tasks.md`)
> **Phases:** 4

---

## Phase Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Foundation                                            │
│  ┌───────────────────────────────┐                             │
│  │ ISSUE-1                       │                             │
│  │ Initialize scaffold + deps    │                             │
│  │ Effort: S | Tests: 0          │                             │
│  └───────────────────────────────┘                             │
│  Exit gate: npm run dev → localhost:5173                        │
└─────────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: Configuration (parallel)                              │
│  ┌───────────────────────┐  ┌───────────────────────┐         │
│  │ ISSUE-2               │  │ ISSUE-3               │         │
│  │ Vite + TS config      │  │ ESLint flat config    │         │
│  │ Effort: M | Tests: 0  │  │ Effort: S | Tests: 0  │         │
│  └───────────────────────┘  └───────────────────────┘         │
│  Exit gate: npm run build, type-check, lint — all zero errors  │
└─────────────────────────────────────────────────────────────────┘
                ├───────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: Test Infrastructure                                   │
│  ┌───────────────────────────────┐                             │
│  │ ISSUE-4                       │                             │
│  │ Vitest env + smoke tests      │                             │
│  │ Effort: M | Tests: 2          │                             │
│  └───────────────────────────────┘                             │
│  Exit gate: npm run test → 2 passed, ≥ 90% App.tsx coverage   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: CI/CD                                                 │
│  ┌───────────────────────────────┐                             │
│  │ ISSUE-5                       │                             │
│  │ GitHub Actions + Pages        │                             │
│  │ Effort: M | Tests: 0 (CI)     │                             │
│  └───────────────────────────────┘                             │
│  Exit gate: CI green on main push, Pages URL resolves          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase Details

### Phase 1 — Foundation

**Issues:** ISSUE-1

**Goal:** Create a working project structure with all npm dependencies installed.

**Parallel opportunities:** None — this is the root dependency for everything.

**Exit gate (must pass before Phase 2):**
- `npm run dev` starts at `localhost:5173` with no console errors
- `node_modules/` populated with all declared dependencies
- `src/App.tsx` stub renders content visible in browser

---

### Phase 2 — Configuration (Parallel)

**Issues:** ISSUE-2 (Vite/TS), ISSUE-3 (ESLint)

**Goal:** Configure the full toolchain — bundler, type checker, and linter.

**Parallel opportunities:** ISSUE-2 and ISSUE-3 have no interdependency.
- **Dev A** can work ISSUE-2 (Vite config, tsconfig files)
- **Dev B** can work ISSUE-3 (eslint.config.js)

These are the only two issues in the entire epic that can run concurrently.

**Exit gate (must pass before Phase 3):**
- `npm run build` produces `dist/` without errors
- `npm run type-check` exits with code 0
- `npm run lint` exits with code 0

---

### Phase 3 — Test Infrastructure

**Issues:** ISSUE-4

**Goal:** Establish the global test environment and prove the smoke tests pass.

**Parallel opportunities:** None — requires both Phase 2 issues to be complete.

**Exit gate (must pass before Phase 4):**
- `npm run test` exits with code 0, output shows "2 passed"
- Coverage report shows ≥ 90% line coverage for `src/App.tsx`
- `npm run lint` passes on test files

---

### Phase 4 — CI/CD

**Issues:** ISSUE-5

**Goal:** Ship the pipeline that makes all local quality gates mandatory on every push.

**Parallel opportunities:** None — the CI pipeline must reflect passing local gates.

**Exit gate (epic completion):**
- GitHub Actions CI job green on push to `main`
- `deploy` job succeeds; GitHub Pages URL resolves and renders stub app
- "Report bundle sizes" CI output confirms < 500 KB gzipped JS

---

## Summary Timeline

| Phase | Issues | Parallel? | New Tests | Cumulative Tests | Exit Gate |
|-------|--------|-----------|-----------|-----------------|-----------|
| 1 — Foundation | 1 | No | 0 | 0 | `npm run dev` works |
| 2 — Config | 2 | **Yes** | 0 | 0 | build + type-check + lint pass |
| 3 — Test Infra | 1 | No | 2 | 2 | `npm run test` 2 passed |
| 4 — CI/CD | 1 | No | 0 (CI run) | 2 | CI green + Pages deployed |

---

## Solo Developer Optimal Order

For a single developer minimizing idle time between steps:

| Step | Issue | Action | Rationale |
|------|-------|--------|-----------|
| 1 | ISSUE-1 | Initialize scaffold + install deps | No alternative — everything else depends on this |
| 2 | ISSUE-2 | Configure Vite + TypeScript | Do this before ESLint because `tsconfig.app.json` influences which TS rules ESLint can see; also sets up Vitest env needed for step 4 |
| 3 | ISSUE-3 | Configure ESLint | Short task; complete it before writing any test files so they're clean from the start |
| 4 | ISSUE-4 | Vitest env + smoke tests | Both ISSUE-2 and ISSUE-3 are now complete; write setup.ts and App.test.tsx |
| 5 | ISSUE-5 | GitHub Actions CI/CD | All local gates pass; define the CI pipeline |

**Total minimum phases for solo developer:** 5 sequential steps (no parallelism available
since only 1 developer).

---

## Two-Developer Split

| Dev | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|-----|---------|---------|---------|---------|
| **Dev A** (critical path) | ISSUE-1 | ISSUE-2 (Vite/TS) | ISSUE-4 (Tests) | ISSUE-5 (CI/CD) |
| **Dev B** (parallel) | — (waits or prepares) | ISSUE-3 (ESLint) | — (assists with ISSUE-4 review) | — (assists with ISSUE-5 review) |

**Notes for two-developer split:**
- Dev B is blocked during Phase 1. Use this time to prepare: read the implementation plan, review Arc42 §07 (deployment view), and set up the GitHub Pages repository setting manually.
- Phase 2 is the only real parallel opportunity (ISSUE-2 and ISSUE-3 are independent).
- After Phase 2, Dev B assists with code review rather than taking on separate implementation tasks, since ISSUE-4 and ISSUE-5 are each single-unit, sequential deliverables.

---

## Quality Checklist

Before closing the epic (after ISSUE-5 is complete), verify:

- [ ] `npm run lint` — zero ESLint errors
- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run test` — 2 tests pass, zero failures
- [ ] `npm run build` — `dist/` produced, zero build errors
- [ ] `dist/assets/*.js` gzipped total < 500 KB (from CI "Report bundle sizes" output)
- [ ] GitHub Actions CI workflow green on push to `main`
- [ ] GitHub Pages deployment succeeds; stub app renders at GitHub Pages URL
- [ ] `@/` alias resolves correctly in both bundler and TypeScript language server
- [ ] `ResizeObserver` stub active in all test runs (required by MUI 6)
- [ ] `toHaveNoViolations` available globally in all test files (from `setup.ts`)

---

## Forward Compatibility Notes

The infrastructure decisions locked in during this epic shape all downstream work:

| Downstream Epic | Depends on |
|----------------|-----------|
| autoinstall-generator-jah (Application Shell) | `@/` alias, MUI peer deps, stub `App.tsx` to replace |
| autoinstall-generator-pqx (Core State Management) | `zod`, `react-hook-form`, `yaml` installed; `setup.ts` stubs active |
| autoinstall-generator-vw6 (Testing & A11y) | 90% coverage threshold, `jest-axe` global, `userEvent` available |
| All form section epics | `@/` alias, `setup.ts` stubs, MUI + RHF + Zod patterns established |
