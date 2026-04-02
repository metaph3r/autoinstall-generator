# Application Shell & Layout: Implementation Sequence

> **Epic:** autoinstall-generator-jah — Application Shell & Layout
> **Issues:** 6 (see `tasks.md`)
> **Phases:** 3

---

## Phase Overview

```
Phase 1 ──────────────────────── Phase 2 ──── Phase 3
[ISSUE-1]                              │
[ISSUE-2]  ← all parallel ──► [ISSUE-5] ──► [ISSUE-6]
[ISSUE-3]  (no interdeps)         │
[ISSUE-4] ─────────────────────────┘
```

---

## Phase 1 — Leaf Modules (Full Parallelism)

**Issues:** ISSUE-1, ISSUE-2, ISSUE-3, ISSUE-4 (4 issues)
**Parallel count:** 4 (all are independent)
**Tests in phase:** 13

All four modules have zero intra-epic dependencies. They can be implemented simultaneously by
any number of developers, or sequentially by a solo developer in any order.

### ISSUE-1: Implement AutoinstallConfigContext stub
```
src/context/AutoinstallConfigContext.tsx  [NEW]
```
- New directory: `src/context/`
- Exports stable hook API consumed by all downstream epics
- 2 tests: hook throws outside Provider; returns value inside Provider

### ISSUE-2: Implement ErrorBoundary component
```
src/components/ErrorBoundary.tsx          [NEW]
src/components/ErrorBoundary.test.tsx     [NEW]
```
- New directory: `src/components/`
- Class component; pure React, no MUI required (MUI Box/Typography in fallback only)
- 3 tests: renders children; default fallback on throw; custom fallback prop

### ISSUE-3: Implement StartPage component
```
src/components/StartPage.tsx              [NEW]
src/components/StartPage.test.tsx         [NEW]
```
- Leaf presentational component; `onStart` callback prop
- 4 tests: heading present; button present; click calls onStart; zero axe violations

### ISSUE-4: Implement FormEditor layout shell
```
src/components/FormEditor.tsx             [NEW]
src/components/FormEditor.test.tsx        [NEW]
```
- Two-column responsive shell; placeholder content only
- 4 tests: renders; form placeholder; YAML placeholder; zero axe violations

**Phase 1 Exit Gate:**
- [ ] All 13 Phase 1 tests pass (`vitest run`)
- [ ] `tsc --noEmit` exits 0 (no type errors in new files)
- [ ] `eslint .` exits 0 (no lint errors in new files)
- [ ] `src/components/StartPage.tsx` and `src/components/FormEditor.tsx` both export named functions (required for Phase 2)

---

## Phase 2 — AppShell Integration (Sequential)

**Issues:** ISSUE-5 (1 issue)
**Parallel count:** 1
**Tests in phase:** 5 (cumulative: 18)

AppShell imports `StartPage` (ISSUE-3) and `FormEditor` (ISSUE-4) directly. TypeScript strict
mode will refuse to compile `AppShell.tsx` if either dependency is absent.

```
ISSUE-3 ──┐
           ├──► ISSUE-5: AppShell.tsx + AppShell.test.tsx
ISSUE-4 ──┘
```

### ISSUE-5: Implement AppShell component
```
src/components/AppShell.tsx               [NEW]
src/components/AppShell.test.tsx          [NEW]
```
- MUI AppBar + Toolbar; `useState` page routing
- Renders StartPage or FormEditor based on page state
- 5 tests: title; GitHub link role+aria-label; StartPage initially; navigation to FormEditor; axe

**Phase 2 Exit Gate:**
- [ ] All 5 Phase 2 tests pass (18 total)
- [ ] `getByRole('link', { name: /view source on github/i })` passes in AppShell test
- [ ] Navigation from StartPage to FormEditor works (clicking "New Project" shows FormEditor)
- [ ] `tsc --noEmit` exits 0
- [ ] `eslint .` exits 0

---

## Phase 3 — App Root Integration (Sequential)

**Issues:** ISSUE-6 (1 issue)
**Parallel count:** 1
**Tests in phase:** 3 (cumulative: 21)

App root is the final composition. All prior phase outputs are prerequisites.

```
ISSUE-1 ──┐
ISSUE-2 ──┤
           ├──► ISSUE-6: App.tsx (modified) + App.test.tsx (modified)
ISSUE-5 ──┘
```

### ISSUE-6: Wire App root and update integration tests
```
src/App.tsx                               [MODIFIED]
src/App.test.tsx                          [MODIFIED]
```
- Replaces placeholder stub with `ErrorBoundary > AutoinstallConfigProvider > AppShell`
- Updates tests to verify composed application behavior
- 3 tests: renders without crashing; StartPage visible; zero axe violations

**Phase 3 Exit Gate (= Epic Completion Gate):**
- [ ] All 21 tests across the epic pass (`vitest run`)
- [ ] `vitest run --coverage` reports ≥ 90% lines, branches, functions, statements for new/modified files
- [ ] `tsc --noEmit` exits 0
- [ ] `eslint .` exits 0
- [ ] `npm run build` completes without errors (bundle size < 500 KB gzipped)
- [ ] All 5 epic acceptance criteria verified (see mapping table below)

---

## Acceptance Criterion → Test Mapping

| Epic AC | Issue | Test That Verifies It |
|---------|-------|-----------------------|
| AppBar renders application title "Autoinstall Generator" | ISSUE-5 | `AppShell.test.tsx`: `getByRole('heading')` or `getByText('Autoinstall Generator')` in Toolbar |
| AppBar renders GitHub link | ISSUE-5 | `AppShell.test.tsx`: `getByRole('link', { name: /view source on github/i })` has `aria-label="View source on GitHub"` |
| StartPage renders and navigates to FormEditor on button click | ISSUE-5 | `AppShell.test.tsx`: initial StartPage visible; userEvent click shows FormEditor |
| Two-column layout renders on desktop, stacked on mobile | ISSUE-4 | `FormEditor.test.tsx`: outer Box has `flexDirection: { xs: 'column', md: 'row' }` in sx |
| Error boundary catches and displays fallback on unexpected errors | ISSUE-2 | `ErrorBoundary.test.tsx`: ThrowingComponent triggers fallback text "Something went wrong" |
| Zero axe-core critical violations | ISSUE-3,4,5,6 | Every test file's `axe(container)` assertion |

---

## Summary Timeline

| Phase | Issues | Parallel Count | New Tests | Cumulative Tests |
|-------|--------|---------------|-----------|-----------------|
| 1 | 4 (ISSUE-1,2,3,4) | 4 | 13 | 13 |
| 2 | 1 (ISSUE-5) | 1 | 5 | 18 |
| 3 | 1 (ISSUE-6) | 1 | 3 | 21 |
| **Total** | **6** | **4 max** | **21** | **21** |

---

## Solo Developer Optimal Order

For a single developer, minimize idle time by completing prerequisites before their dependents:

```
1. ISSUE-2 — ErrorBoundary
   Rationale: Fastest issue (pure React class, minimal MUI); creates the components/
   directory; sets up the test pattern (ThrowingComponent helper) used nowhere else.

2. ISSUE-1 — AutoinstallConfigContext stub
   Rationale: Pure React, no MUI; establishes the stable hook API that ISSUE-6 depends on.
   No blocking dependencies on ISSUE-2 but better to complete Phase 1 before moving to Phase 2.

3. ISSUE-3 — StartPage
   Rationale: Leaf component; must be done before ISSUE-5. Shorter than FormEditor.

4. ISSUE-4 — FormEditor layout shell
   Rationale: Leaf component; must be done before ISSUE-5. Two-column sx logic is the core
   of this epic's layout work — do it adjacent to StartPage for context coherence.

5. ISSUE-5 — AppShell
   Rationale: First sequential issue; all Phase 1 prerequisites now satisfied.

6. ISSUE-6 — App root wire-up
   Rationale: Final composition; all issues are complete; run full coverage check here.
```

---

## Two-Developer Split

| | Dev A (critical path) | Dev B (parallel) |
|-|----------------------|-----------------|
| **Phase 1** | ISSUE-1 (Context stub) → ISSUE-3 (StartPage) | ISSUE-2 (ErrorBoundary) → ISSUE-4 (FormEditor) |
| **Phase 2** | ISSUE-5 (AppShell) | — (review ISSUE-5, assist with test coverage) |
| **Phase 3** | ISSUE-6 (App root wire-up) | — (review ISSUE-6, run full quality gate) |

Dev A drives the critical path (ISSUE-3 → ISSUE-5 → ISSUE-6). Dev B completes Phase 1 in
parallel, then shifts to review and quality verification. Total wall-clock depth: 3 phases.

---

## File Creation Map

```
src/
├── App.tsx                                 MODIFIED in ISSUE-6
├── App.test.tsx                            MODIFIED in ISSUE-6
├── context/
│   └── AutoinstallConfigContext.tsx        CREATED in ISSUE-1
│   └── AutoinstallConfigContext.test.tsx   CREATED in ISSUE-1 (optional co-located)
└── components/
    ├── ErrorBoundary.tsx                   CREATED in ISSUE-2
    ├── ErrorBoundary.test.tsx              CREATED in ISSUE-2
    ├── StartPage.tsx                       CREATED in ISSUE-3
    ├── StartPage.test.tsx                  CREATED in ISSUE-3
    ├── FormEditor.tsx                      CREATED in ISSUE-4
    ├── FormEditor.test.tsx                 CREATED in ISSUE-4
    ├── AppShell.tsx                        CREATED in ISSUE-5
    └── AppShell.test.tsx                   CREATED in ISSUE-5
```

No files are deleted. `src/main.tsx`, `src/vite-env.d.ts`, and `src/test/setup.ts` are
unchanged across all issues.
