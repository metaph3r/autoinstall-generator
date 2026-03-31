# ADR Consistency Review

> **Date:** 2026-03-31
> **ADRs reviewed:** ADR-001, ADR-002, ADR-003, ADR-004, ADR-005 (all ADRs in `SourceDocuments/adr/`)
> **Findings:** 2 critical, 7 important, 8 advisory

---

## Executive Summary

The five ADRs form a coherent, well-reasoned architectural foundation for the autoinstall-generator
project. Technology choices are internally consistent and mutually reinforcing. However, two critical
issues require correction before arc42 §05 can be reliably implemented: a factual discrepancy on how
many sections use the YAML editor escape hatch (2 in ADR-001 vs. 3 in the source Q-1 resolution),
and a contradict library claim about MUI 6's React version requirements. Seven important findings
address stale Vite technical claims, scope overlap between ADR-001 and ADR-004 on storage navigation,
uncited claims about target audience and SPA architecture, and two missing ADRs (YAML error handling,
testing strategy) whose absence creates implementation ambiguity. Eight advisory findings cover
cross-referencing gaps, mild framing inconsistencies, and three additional ADR candidates.

---

## Critical Findings

### C-1: YAML Editor Scope — 2 Sections (ADR-001) vs. 3 Sections (resolved-questions.md Q-1)

- **Agents:** Contradiction Detector, Source Alignment Checker
- **Affected ADRs:** ADR-001
- **Source document:** `architecture/questions/resolved-questions.md` Q-1
- **Description:** ADR-001's Decision section commits to "exactly two sections" using the YAML editor
  escape hatch (Network and Storage Action mode). User-Data is explicitly moved to a structured form
  scoped to the cloud-init `users` module. However, the source Q-1 resolution that triggered ADR-001
  still reads: "§05: `YamlEditorDialog` component must appear in the building block view; **3 sections
  use it (Network, Storage Action, User-Data)**." ADR-001's own Arc42 Impact table correctly states
  "2 sections use it," creating a three-way conflict: ADR-001 Decision (2), ADR-001 Arc42 Impact (2),
  Q-1 resolution (3). Any implementor reading only the resolved-questions.md will implement §05
  incorrectly with three YAML editor instances.
- **Evidence:**
  - ADR-001 Decision: "embedded YAML editors…are used as intentional escape hatches for **exactly
    two sections**: 1. Network…2. Storage Action mode"
  - ADR-001 Consequences/Neutral: "User-Data is scoped to the cloud-init `users` module…
    structured form scoped to the cloud-init `users` module."
  - `resolved-questions.md` Q-1: "§05: `YamlEditorDialog` component must appear in the building block
    view; **3 sections use it (Network, Storage Action, User-Data)**"
- **Recommended action:** Update `resolved-questions.md` Q-1 impact statement to read "2 sections use
  YamlEditorDialog (Network, Storage Action mode); User-Data uses a structured form." No change to
  ADR-001 is needed — it is internally consistent.

---

### C-2: MUI 6 React Version Requirement — Library Claim Contradicted

- **Agents:** Library Validation Agent
- **Affected ADRs:** ADR-005
- **Description:** ADR-005 states "MUI 6 targets React 18+" and lists this as the rationale for
  choosing React 18+. The npm registry for `@mui/material` v6.4.11 lists the peer dependency as
  `"react": "^17.0.0 || ^18.0.0 || ^19.0.0"`. MUI 6 supports React 17, 18, and 19; it does NOT
  require React 18 as a minimum.
- **Evidence:**
  - ADR-005: "MUI 6 dependency: MUI 6 targets React 18+. Choosing React 18+ is a prerequisite for
    using MUI 6, which is the specified UI library."
  - npm registry `@mui/material` v6.4.11 peer deps: `"react": "^17.0.0 || ^18.0.0 || ^19.0.0"`
- **Impact:** The rationale for React 18+ is still valid on other grounds (concurrent rendering for
  live preview, `useTransition`/`useDeferredValue`, largest ecosystem breadth), but the specific
  "prerequisite for MUI 6" claim is factually incorrect. A reader might infer that downgrading to
  React 17 would break MUI 6, which is false.
- **Recommended action:** Revise ADR-005 React 18+ rationale bullet to: "MUI 6 is compatible with
  React 17, 18, and 19 (peer dependency `^17.0.0 || ^18.0.0 || ^19.0.0`); React 18 is chosen
  specifically for concurrent rendering features (`useTransition`, `useDeferredValue`) that enable
  non-blocking YAML preview updates." Remove the claim that React 18 is "a prerequisite for using MUI 6."

---

## Important Findings

### I-1: Storage Mode Toggle Classified as "Design Detail" — Scope Overlap Between ADR-001 and ADR-004

- **Agents:** Contradiction Detector, Completeness Checker
- **Affected ADRs:** ADR-001, ADR-004
- **Description:** ADR-001 describes Storage as having two sub-modes: Layout mode (structured form
  with radio group) and Action mode (YAML editor escape hatch). ADR-004 notes the toggle between
  these modes but dismisses it: "The Storage section has two sub-modes; the UI must allow the user
  to toggle between Layout mode (structured form) and Action mode (YAML editor). **This toggle is a
  design detail, not an architectural constraint.**" This is incorrect: the toggle mechanism (radio
  button within a form section, tab within the Storage tab group, or separate UI element) determines
  whether the `YamlEditorDialog` is conditionally rendered or always present, which directly affects
  the §05 building block view and the §06 runtime scenario for escape-hatch usage. Neither ADR
  cross-references the other.
- **Evidence:**
  - ADR-001 Neutral: "The Storage section has two sub-modes; the UI must allow the user to toggle
    between Layout mode (structured form) and Action mode (YAML editor). This toggle is a design
    detail, not an architectural constraint."
  - ADR-004 Tab Groups table: "Storage | storage (Layout mode + Action mode YAML editor escape hatch)"
    — no navigation strategy for the toggle.
- **Recommended action:** ADR-001 and ADR-004 should cross-reference each other. ADR-001 should
  acknowledge that the Storage mode toggle affects the `FormNavigation` building block described in
  ADR-004. ADR-004 should acknowledge that the Storage tab group contains a conditional mode toggle
  whose implementation is constrained by ADR-001's escape-hatch decision.

---

### I-2: Vite Default Build Target — Claim Contradicted by Documentation

- **Agents:** Library Validation Agent
- **Affected ADRs:** ADR-002
- **Description:** ADR-002 states "Vite's default build target (ES2015+ via esbuild) aligns with
  the evergreen browser support matrix." Vite 6 documentation shows the default production build
  target is a modern browser baseline (Chrome 87+, Firefox 78+, Safari 14+, Edge 88+) — which is
  above ES2015. ES2015 is the lowest _configurable_ floor, not the default. Additionally, esbuild
  handles transpilation in dev mode; production builds go through Rollup (Vite 6) or Rolldown
  (Vite 7/8). The phrase "ES2015+ via esbuild" conflates dev and prod pipelines.
- **Evidence:**
  - ADR-002: "Vite's default build target (ES2015+ via esbuild) aligns with the evergreen browser
    support matrix (see Q-6)"
  - Vite 6 docs: default build targets Chrome 87+, Firefox 78+, Safari 14+, Edge 88+ (above ES2015);
    production build via Rollup, not esbuild.
- **Recommended action:** Revise to: "Vite's default production build targets modern evergreen
  browsers (Chrome 87+, Firefox 78+, Safari 14+, Edge 88+), aligned with the evergreen browser
  support matrix (§02). ES2015 is the minimum configurable build floor."

---

### I-3: Vite Rollup-Based Production Builds — Stale Claim (Rolldown in Vite 7/8)

- **Agents:** Library Validation Agent
- **Affected ADRs:** ADR-002
- **Description:** ADR-002 states "Rollup-based production builds with superior tree-shaking." This
  was accurate for Vite 6 (the current version at ADR authoring, 2026-03-31). Vite 7 and Vite 8
  have migrated production builds to **Rolldown** (a Rust-based bundler), replacing Rollup. The
  tree-shaking claim remains valid (Rolldown provides equivalent or superior tree-shaking), but the
  specific "Rollup-based" description will become incorrect upon upgrading to Vite 7+.
- **Evidence:**
  - ADR-002: "Rollup-based production builds with superior tree-shaking"
  - Vite 8 announcement: production builds migrated to Rolldown
- **Recommended action:** Note in ADR-002 that "Rollup-based production builds" applies to Vite 6;
  annotate that Vite 7+ uses Rolldown. Not blocking, but worth tracking to avoid confusion during
  future Vite upgrades.

---

### I-4: Target Audience "Sysadmins, DevOps Engineers" Not in SPEC.md — Uncited Claim

- **Agents:** Source Alignment Checker
- **Affected ADRs:** ADR-004
- **Description:** ADR-004 uses the target audience as a primary rationale for choosing Tabs over
  Stepper: "The target audience is explicitly **'sysadmins, DevOps engineers'** (`SPEC.md`, §Ziel
  der Anwendung) — expert users who already know the Ubuntu Autoinstall schema." However, SPEC.md
  §Ziel der Anwendung does not name sysadmins or DevOps engineers. The spec states "die
  formularbasierte Erstellung einer vollständigen `autoinstall.yaml`" (form-based creation of a
  complete autoinstall.yaml) without specifying user roles. The audience claim is a reasonable
  derivation but is not an explicit SPEC.md statement.
- **Evidence:**
  - ADR-004: "(SPEC.md, §Ziel der Anwendung) — expert users who already know Ubuntu's Autoinstall
    schema"
  - SPEC.md §Ziel der Anwendung: "Webanwendung ermöglicht die formularbasierte Erstellung einer
    vollständigen `autoinstall.yaml`" — no mention of sysadmins or DevOps engineers.
- **Recommended action:** Revise ADR-004 citation to: "The target audience is inferred as sysadmins
  and DevOps engineers — users who configure unattended Ubuntu installations — based on the tool's
  purpose (`SPEC.md`, §Ziel der Anwendung). The spec does not explicitly name user roles."
  Add "(inferred)" to avoid misleading future readers into thinking SPEC.md explicitly names the
  audience.

---

### I-5: "Pure Client-Side SPA" Not Explicitly in SPEC.md — Uncited Claim

- **Agents:** Source Alignment Checker
- **Affected ADRs:** ADR-002
- **Description:** ADR-002 states "The application is a **pure client-side SPA** with no backend,
  no server-side rendering, no database, and no API. The entire application runs in the browser."
  This is correct but is presented as a SPEC.md fact rather than a derivation. SPEC.md does not
  explicitly state "no backend" or "pure SPA"; the inference is made from the complete absence of
  any backend mention across the entire document.
- **Evidence:**
  - ADR-002: "The application is a **pure client-side SPA** with no backend…"
  - SPEC.md: Entire document discusses forms, YAML generation, UI components; no backend,
    authentication, or server component is mentioned — confirmed by Agent 2 review.
- **Recommended action:** Add "(inferred from the complete absence of any server-side component in
  `SPEC.md`)" to the claim. Minor documentation improvement; the inference is well-founded.

---

### I-6: Missing ADR-006 — YAML Parse Error Handling Strategy

- **Agents:** Completeness Checker
- **Affected ADRs:** ADR-001 (consequence not fully documented)
- **Description:** ADR-001 documents the escape-hatch decision but does not specify the error
  handling strategy when a user submits malformed YAML in the escape-hatch dialog. The strategy
  is scattered informally across §06 Runtime View (Scenario 2), §08 Crosscutting Concepts
  (Validation section), and §11 Risk Register (R-3). No ADR formalizes the pattern:
  parse-check-on-confirm, inline error display, keep dialog open on failure. This affects §05
  (YamlEditorDialog component behavior), §06 (runtime scenario completeness), and §08 (validation
  crosscutting concept).
- **Recommended action:** Create **ADR-006: "YAML Editor Error Handling — Parse-Check-on-Confirm
  with Inline Error Display."** Context: escape-hatch YAML strings are opaque to Zod; only syntax
  validation is feasible. Decision: on Dialog confirm, run `yaml.parse(editedYaml)`; on failure,
  display inline error and keep dialog open; on success, dispatch raw string to reducer. Consequences:
  semantically invalid (but syntax-valid) YAML can still enter state; a YAML syntax gate is the
  minimum viable safeguard; no server-side validation is possible (client-side only).

---

### I-7: Missing ADR-007 — Testing Strategy

- **Agents:** Completeness Checker
- **Affected ADRs:** ADR-002 (Vitest chosen but not stratified)
- **Description:** ADR-002 establishes Vitest as the test runner and mentions `@testing-library/react`
  and `jest-axe` in the CI pipeline, but no ADR documents the testing strategy: unit vs. integration
  vs. accessibility test split, test coverage targets, fixture patterns, or reducer testing approach.
  §10 Quality Requirements mandates "zero critical axe-core violations in CI" (QA-7) but provides
  no implementation guidance. Developers lack authoritative direction on test structure.
- **Recommended action:** Create **ADR-007: "Testing Strategy — Three-Tier: Unit + Integration +
  jest-axe Accessibility."** Context: Vitest is the runner (ADR-002); WCAG 2.1 AA is the
  accessibility target (§02, §10). Decision: (1) Unit tests for Zod schemas, reducer logic, YAML
  serialization; (2) Integration tests for form section → state → YAML preview flow via
  `@testing-library/react`; (3) Accessibility tests via `jest-axe` on all interactive components.
  Consequences: CI gates prevent regressions on correctness, UX, and a11y; test structure is
  discoverable and consistent across sections.

---

## Advisory Findings

### A-1: ADR-001 — "YAML‑Editor oder Formular" Presents Options as Equal; ADR Implies Prioritization

- **Agents:** Source Alignment Checker
- **Affected ADRs:** ADR-001
- **Description:** ADR-001 states "'YAML‑Editor oder Formular' — YAML editor listed first" as
  evidence for the escape-hatch decision for Network. SPEC.md uses "oder" (or), treating both
  options as equals. Listing order is not a reliable signal of priority in German technical prose.
  The escape-hatch decision is still well-supported by the `any` type in the data model, the JSON
  Schema evidence, and the Storage "empfohlen" language, but the "listed first" claim slightly
  overstates the source.
- **Recommended action:** Revise ADR-001 reference to: "`SPEC.md`, §Network: 'YAML‑Editor oder
  Formular' (YAML editor and form presented as equal options; YAML editor chosen here based on
  Netplan's structural complexity and the `network?: any` TypeScript type)."

---

### A-2: ADR-002 — PR Preview Limitation Framing Inconsistency

- **Agents:** Contradiction Detector
- **Affected ADRs:** ADR-002
- **Description:** ADR-002 Consequences/Negative states "PR preview deployments require a separate
  solution (Netlify/Vercel) or a manual workaround." ADR-002 Alternatives/Alternative C dismisses
  Netlify/Vercel: "This decision can be revisited if PR previews or advanced deployment features
  become necessary." The first section treats the gap as a present limitation; the second treats it
  as a hypothetical future concern. The severity is unclear.
- **Recommended action:** Align both sections. Either document PR preview absence as a known
  limitation in §11 Technical Debt, or explicitly state "PR previews are deferred to v2 if adoption
  warrants the SaaS dependency."

---

### A-3: ADR-003 and ADR-005 — YAML Topic Overlap Not Cross-Referenced

- **Agents:** Contradiction Detector
- **Affected ADRs:** ADR-003, ADR-005
- **Description:** Both ADRs discuss YAML handling but for different purposes: ADR-003 covers
  display (syntax highlighting) and ADR-005 covers serialization (the `yaml` npm package). There
  is no contradiction, but no cross-reference exists between them. A developer working on the YAML
  Preview component who reads ADR-003 gets no pointer to ADR-005's YAML serialization rationale,
  and vice versa.
- **Recommended action:** Add to ADR-003 References: "For YAML serialization (output generation),
  see ADR-005 (`yaml` npm package rationale)." Add to ADR-005 References: "For YAML display
  (syntax highlighting in the preview panel), see ADR-003."

---

### A-4: ADR-004 — Stepper Rejection vs. Novice User Gap Internal Inconsistency

- **Agents:** Contradiction Detector
- **Affected ADRs:** ADR-004
- **Description:** ADR-004 Alternative A rejects Stepper as "optimized for onboarding flows…not
  for expert configuration tools." ADR-004 Consequences/Negative then states "Users who don't know
  the Autoinstall schema well enough to know which section they need are underserved in v1." If
  Stepper is the natural onboarding pattern, then not providing it for novice users is inconsistent
  with the rejection rationale. The ADR should either (a) acknowledge Stepper's value for novices
  and explicitly defer it with a v2 commitment, or (b) propose an alternative novice UX (e.g., a
  Getting Started guide within the form editor).
- **Recommended action:** Add to ADR-004 Consequences/Negative: "Novice users are explicitly
  deferred to v2 where a guided Stepper mode or onboarding overlay may be added. This is an
  intentional v1 scope constraint, not an oversight."

---

### A-5: Q-1 / ADR-001 — No Reciprocal Link from resolved-questions.md to ADR-001

- **Agents:** Contradiction Detector
- **Affected ADRs:** ADR-001
- **Description:** ADR-001 correctly references "Triggered by: Q-1 (resolved-questions.md)."
  However, the Q-1 entry in resolved-questions.md does not include a reciprocal "Formalized in:
  ADR-001" link. The same asymmetry exists for ADR-002 through ADR-005 and Q-2, Q-3, Q-4, Q-8.
  This makes it harder to navigate from a question to its formalized ADR.
- **Recommended action:** Add "Formalized in: ADR-00N (Proposed)" to each resolved question
  that has a corresponding ADR.

---

### A-6: Missing ADR-008 — Reducer Action Type Taxonomy

- **Agents:** Completeness Checker
- **Affected ADRs:** ADR-005 (consequence)
- **Description:** ADR-005 establishes React Context + Reducer as the state management pattern
  but does not document the action type taxonomy. §08 Crosscutting Concepts provides example
  action types but not the complete set or design rules for grouping. Implementation will be
  inconsistent across sections without this guidance.
- **Recommended action:** Create **ADR-008: "Reducer Action Type Design — One Action per Logical
  Section Group."** Low urgency (can be written alongside implementation); formalize informally
  existing §08 pattern.

---

### A-7: Missing ADR-009 — Autoinstall Schema Synchronization Strategy

- **Agents:** Completeness Checker
- **Affected ADRs:** ADR-005, §11 R-1
- **Description:** Risk R-1 (Autoinstall Schema Drift) proposes using `json-schema-to-typescript`
  to generate TypeScript types at build time but frames it as "Consider…" rather than a committed
  decision. No ADR documents whether schema generation is adopted (v1) or deferred (v2). The
  embedded JSON Schema's role (static vs. fetched at build time) is undefined.
- **Recommended action:** Create **ADR-009: "Autoinstall Schema Synchronization — Embedded JSON
  Schema with Manual Type Maintenance (v1); Build-Time Generation (v2 candidate)."** This makes
  the v1 scope explicit and gives a clear upgrade path.

---

### A-8: PrismJS YAML Grammar ~8 KB — Unverifiable Bundle Size Claim

- **Agents:** Library Validation Agent
- **Affected ADRs:** ADR-003
- **Description:** ADR-003 states "PrismJS YAML grammar (~8 KB)" and "one theme (~5 KB)" as
  bundle size contributions. These figures could not be confirmed from accessible documentation or
  bundle analysis sources. PrismJS's modular architecture (confirmed) supports small per-language
  grammars in general, but the specific 8 KB figure is unverifiable. ADR-003 itself notes
  "context7 is not available in this environment" for these figures.
- **Impact:** Low risk. The claim supports the bundle size rationale (< 500 KB target from Q-10)
  but the exact figure is uncertain. The structural argument (modular = smaller than monolithic
  Highlight.js) is sound.
- **Recommended action:** Add "(estimated; not verified against current bundle analysis)" to the
  ~8 KB figure. No architectural change needed.

---

## Library Validation Matrix

| ADR | Library | Capability Claimed | context7 Finding | Status |
|-----|---------|-------------------|-----------------|--------|
| ADR-002 | Vite | Rollup-based production builds | Accurate for Vite 6; Vite 7/8 uses Rolldown | STALE |
| ADR-002 | Vite | esbuild transpilation 10-100x faster than Babel | Official docs say "faster than JS-based bundlers"; Babel not specifically named | CONFIRMED with caveat |
| ADR-002 | Vite | Default build target ES2015+ via esbuild | Default is modern browser baseline (above ES2015); ES2015 is minimum configurable floor; prod builds use Rollup not esbuild | CONTRADICTED |
| ADR-002 | Vite | Native ESM serving in dev; near-instant HMR | Confirmed by vite.dev | CONFIRMED |
| ADR-002 | Vitest | Jest-compatible API | Confirmed by vitest.dev | CONFIRMED |
| ADR-002 | Vitest | Uses same config as Vite (vite.config.ts) | Confirmed by vitest.dev | CONFIRMED |
| ADR-003 | react-syntax-highlighter | Supports PrismJS and Highlight.js backends | Confirmed by GitHub README | CONFIRMED |
| ADR-003 | react-syntax-highlighter | Switching backends does not require API changes | Confirmed by GitHub README | CONFIRMED |
| ADR-003 | react-syntax-highlighter | Import pattern `{ Prism as SyntaxHighlighter }` | Confirmed by GitHub README | CONFIRMED |
| ADR-003 | react-syntax-highlighter | Theme: `.../dist/esm/styles/prism` | Confirmed by GitHub README | CONFIRMED |
| ADR-003 | PrismJS | YAML grammar ~8 KB gzipped | Architecture modular (confirmed); specific size not verifiable | UNVERIFIABLE |
| ADR-005 | React 18 | `useTransition` and `useDeferredValue` for non-urgent updates | Confirmed by react.dev | CONFIRMED |
| ADR-005 | MUI v6 | Requires React 18+ | Peer dependency `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` — React 17 supported | CONTRADICTED |
| ADR-005 | MUI v6 | Tabs, Stepper, Accordion, TextField, Select, Switch, Checkbox, Table, Dialog, AppBar in single package | All confirmed as `@mui/material` core components | CONFIRMED |
| ADR-005 | MUI v6 | WAI-ARIA compliance as "first-class concern" | ARIA present in components; MUI accessibility guide URL returned 404; formal commitment statement unconfirmed | UNVERIFIABLE |
| ADR-005 | React Hook Form | Uses uncontrolled components via ref | Confirmed by GitHub README | CONFIRMED |
| ADR-005 | React Hook Form | `@hookform/resolvers/zod` connects Zod to RHF | Confirmed by resolvers repo | CONFIRMED |
| ADR-005 | React Hook Form | Field changes do not cause full tree re-render | Confirmed by GitHub README | CONFIRMED |
| ADR-005 | Zod | `z.infer<typeof schema>` generates TypeScript types | Confirmed by zod.dev | CONFIRMED |
| ADR-005 | Zod | Integrates with RHF via @hookform/resolvers | Confirmed by both zod.dev and resolvers repo | CONFIRMED |
| ADR-005 | yaml (Eemeli Aro) | Full YAML 1.2 specification support | yaml-test-suite compliance documented | CONFIRMED |
| ADR-005 | js-yaml | YAML 1.2 only partially supported | js-yaml README documents known deviations | CONFIRMED |
| ADR-005 | yaml (Eemeli Aro) | First-class TypeScript types built in | Bundled types (min TS 5.9); no separate @types needed | CONFIRMED |

---

## ADR Coverage Matrix

| Arc42 Section | ADRs | Coverage |
|--------------|------|----------|
| §01 Introduction and Goals | ADR-001, ADR-004, ADR-005 | Adequate — goal statement, stakeholders, scope documented; ADR-001 narrowed goal statement |
| §02 Constraints | ADR-002, ADR-005 | Adequate — technical, browser, accessibility, organizational constraints all present |
| §03 Context and Scope | ADR-001, ADR-002 | Adequate — business/technical context, external interfaces, scope boundaries clear |
| §04 Solution Strategy | ADR-001, ADR-002, ADR-004, ADR-005 | Adequate — technology, UX, data, quality strategy documented with ADR refs |
| §05 Building Block View | ADR-001, ADR-004 | Adequate — Level 1 & 2 decomposition, tab groups, data model; YamlEditorDialog scoped correctly (2 sections) once C-1 is resolved |
| §06 Runtime View | ADR-001, ADR-003, ADR-005 | Sparse — 5 scenarios documented; YAML error handling scenario (escape-hatch failure) is informal; ADR-006 needed |
| §07 Deployment View | ADR-002 | Adequate — infrastructure, CI/CD pipeline, build artifacts, environments |
| §08 Crosscutting Concepts | ADR-001, ADR-002, ADR-003, ADR-005 | Sparse — state management, form handling, validation, YAML serialization, syntax highlighting, a11y, responsive layout documented; reducer action taxonomy and YAML error handling are informal; ADR-006, ADR-007, ADR-008 needed |
| §09 Architecture Decisions | ADR-001 through ADR-005 | Adequate — summary table and full narrative for 5 ADRs; ADR-006 through ADR-009 missing |
| §10 Quality Requirements | ADR-002, ADR-005 | Adequate — quality tree, SLO table, quality scenarios present; test coverage targets incomplete (ADR-007 needed) |
| §11 Risks and Technical Debt | ADR-001, ADR-002 | Adequate — 4 risks, 3 technical debt items; R-1 and R-3 mitigations reference ADR-006 and ADR-009 informally |
| §12 Glossary | — | Adequate — 8 domain terms defined; no ADR dependency |

---

## Completeness Gaps

### Resolved questions without ADRs

All 5 ADR candidates (Q-1 through Q-4, Q-8) have been formalized in ADR-001 through ADR-005. No
resolved question marked "ADR candidate: yes" is missing its ADR.

The following questions were correctly resolved without ADRs: Q-5 (scope note in §05), Q-6
(§02 constraint), Q-7 (§10 quality requirement), Q-9 (§01 stakeholder table), Q-10 (§10 SLO
table), Q-11 (§11 risk register), Q-12 (§12 glossary).

### Missing ADRs (consequence-triggered candidates)

| Candidate | Triggered by | Urgency | Sections affected |
|-----------|-------------|---------|------------------|
| ADR-006: YAML Editor Error Handling | ADR-001 consequences | **High** — needed before escape-hatch components are built | §06, §08, §11 |
| ADR-007: Testing Strategy | ADR-002 consequences | **High** — needed before test code is written | §07, §08, §10 |
| ADR-008: Reducer Action Type Taxonomy | ADR-005 consequences | Medium — formalize existing §08 informal pattern | §04, §05, §08 |
| ADR-009: Schema Synchronization Strategy | §11 R-1 mitigation | Medium — defines v1 approach; prevents drift | §02, §11 |

### Arc42 sections with no ADR coverage

All 12 arc42 sections have at least one ADR contributing content. No section has zero ADR coverage.
§12 Glossary has no ADR dependency by design (glossary terms are factual, not decision-based).
§06 and §08 are the weakest sections due to the informal handling of YAML error handling and
testing patterns — these will be resolved when ADR-006 and ADR-007 are written.
