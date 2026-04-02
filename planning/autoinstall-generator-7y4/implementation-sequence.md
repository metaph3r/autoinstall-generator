# Form Sections: Configuration Tab: Implementation Sequence

> **Epic:** autoinstall-generator-7y4 — Form Sections: Configuration Tab
> **Issues:** 8 (see `tasks.md`)
> **Phases:** 2

---

## Phase 1 — Implement All Seven Form Components (Parallel)

All seven form components are independent leaf modules. They share no mutual dependencies
and can be developed concurrently. Each reads/writes only via `useAutoinstallConfig()`,
which is already complete from autoinstall-generator-pqx.

**Issues in this phase:**

| Issue | Title | Effort | Tests |
|-------|-------|--------|-------|
| ISSUE-1 | Implement TimezoneForm component | S | 5 |
| ISSUE-2 | Implement UpdatesForm component | S | 5 |
| ISSUE-3 | Implement ShutdownForm component | S | 5 |
| ISSUE-4 | Implement ReportingForm component | M | 9 |
| ISSUE-5 | Implement UserDataForm component | M | 7 |
| ISSUE-6 | Implement DebconfSelectionsForm component | S | 4 |
| ISSUE-7 | Implement ZDevsForm component | M | 7 |

**Parallel sub-groups within Phase 1:**

```
Sub-group A (simple, select/textfield pattern — start these first):
  ISSUE-1 (TimezoneForm)
  ISSUE-2 (UpdatesForm)
  ISSUE-3 (ShutdownForm)
  ISSUE-6 (DebconfSelectionsForm)

Sub-group B (medium complexity — dynamic state, add/remove rows):
  ISSUE-4 (ReportingForm)
  ISSUE-5 (UserDataForm)
  ISSUE-7 (ZDevsForm)
```

Sub-groups A and B are fully parallel with each other. Within each sub-group,
issues are also parallel.

**Phase 1 ASCII diagram:**

```
[Phase 1 — all parallel]

  ISSUE-1 TimezoneForm          ──────────────────────┐
  ISSUE-2 UpdatesForm           ──────────────────────┤
  ISSUE-3 ShutdownForm          ──────────────────────┤
  ISSUE-4 ReportingForm         ──────────────────────┼──→ [Phase 1 exit gate]
  ISSUE-5 UserDataForm          ──────────────────────┤
  ISSUE-6 DebconfSelectionsForm ──────────────────────┤
  ISSUE-7 ZDevsForm             ──────────────────────┘
```

**Phase 1 exit gate:**
- All 7 `.tsx` component files exist and compile (`npm run type-check` passes)
- All 7 `.test.tsx` files exist and pass (`npm run test` — 42 component-level tests)
- Each component has an `it('has no axe-core critical violations')` test passing
- `npm run lint` passes with zero errors

---

## Phase 2 — Wire Configuration Tab in FormContent.tsx

**Issues in this phase:**

| Issue | Title | Effort | Tests |
|-------|-------|--------|-------|
| ISSUE-8 | Wire Configuration tab components into FormContent.tsx | S | 2 |

**Phase 2 ASCII diagram:**

```
[Phase 2 — sequential after Phase 1]

  [Phase 1 exit gate]  ──→  ISSUE-8 FormContent wiring  ──→  [Phase 2 exit gate]
                                                                       │
                                                                       ▼
                                                        autoinstall-generator-vw6
                                                        (A11y & Quality Gates)
```

**Phase 2 exit gate:**
- `FormContent.tsx` imports and renders all 7 form components in the Configuration tab
- `FormContent.test.tsx` has ≥ 2 new passing tests confirming Configuration tab content
- `npm run test` passes with zero failures (≥ 44 tests total across all new/modified files)
- `npm run type-check` passes with zero errors
- `npm run lint` passes with zero errors

---

## Summary Timeline

| Phase | Issues | Parallel | New Tests | Cumulative Tests |
|-------|--------|----------|-----------|------------------|
| Phase 1 | 7 | 7 (all) | 42 | 42 |
| Phase 2 | 1 | 0 | 2 | 44 |
| **Total** | **8** | — | **44** | **44** |

---

## Solo Developer Optimal Order

Recommended ordering for a single developer to minimize blocked time:

1. **ISSUE-2** (UpdatesForm) — simplest Select pattern; establishes the Select+Controller+dispatch template
2. **ISSUE-3** (ShutdownForm) — identical pattern to UpdatesForm; copy-adapt from ISSUE-2
3. **ISSUE-1** (TimezoneForm) — TextField variant of the same pattern; adapts the dispatch to string
4. **ISSUE-6** (DebconfSelectionsForm) — simplest of all; no RHF, just useState; quick win
5. **ISSUE-5** (UserDataForm) — structured RHF form; reuses TextField pattern; introduces Switch field
6. **ISSUE-7** (ZDevsForm) — dynamic table with local state; introduces add/remove row pattern
7. **ISSUE-4** (ReportingForm) — most complex; dynamic nested structure; benefits from ZDevsForm experience
8. **ISSUE-8** (FormContent wiring) — mechanical once all 7 components exist

**Rationale:**
- Start with the simplest repeatable patterns (ISSUE-2, 3, 1) to establish the template
- Do the simple outlier (ISSUE-6) while momentum is high from simple forms
- Build up to complexity: ISSUE-5 (flat RHF) → ISSUE-7 (dynamic table) → ISSUE-4 (nested dynamic)
- ISSUE-8 must be last (blocked by all others); it is trivially fast once all components exist

---

## Two-Developer Split

| Developer | Issues | Focus | Tests | Notes |
|-----------|--------|-------|-------|-------|
| Dev A | ISSUE-1, ISSUE-2, ISSUE-3, ISSUE-6, ISSUE-8 | Simple forms + wiring | 5+5+5+4+2 = 21 | Handle wiring (ISSUE-8) once Dev B ships their components |
| Dev B | ISSUE-4, ISSUE-5, ISSUE-7 | Dynamic/complex forms | 9+7+7 = 23 | Parallel development; ISSUE-8 waits on all of these |

**Critical path for two developers:**
- Dev A finishes ISSUE-1/2/3/6 quickly (all S effort) and can do ISSUE-8 as soon as Dev B ships
- Dev B's ISSUE-4 (ReportingForm, M effort) is likely the overall critical path item
- Dev A can start ISSUE-8 partially (wiring Dev A's components) but must wait for Dev B to merge
  before the full wiring is complete

```
Dev A:  ISSUE-2 → ISSUE-3 → ISSUE-1 → ISSUE-6 ──────────────────────┐
                                                                       ├─→ ISSUE-8
Dev B:  ISSUE-5 ─────────────→ ISSUE-7 ──────────→ ISSUE-4 ──────────┘
        (shortest)              (medium)              (longest)
```

The overall wall-clock time is bounded by Dev B's ISSUE-4 (ReportingForm, M effort).
