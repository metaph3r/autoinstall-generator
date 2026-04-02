# Arc42 Consistency Review

> **Date:** 2026-04-02
> **Sections reviewed:** §01, §02, §03, §04, §05, §06, §07, §08, §09, §10, §11, §12 (all sections)
> **Findings:** 1 critical, 4 important, 9 advisory

---

## Executive Summary

The arc42 documentation is structurally coherent and internally well-sourced. All cross-reference
links resolve correctly, all 12 resolved questions are incorporated, and the key architectural
decisions are documented consistently across sections. However, one critical finding requires
immediate correction: §02 propagates a factually incorrect library claim from ADR-005 that React 18
is a prerequisite for MUI 6 (MUI 6 supports React 17, 18, and 19). Four important findings address
a §05 Mermaid diagram inconsistency, two stale Vite technology claims from the ADR consistency
review that were not incorporated into the arc42 sections, and an unexpanded abbreviation in the
§01 quality goals. Nine advisory findings cover terminology drift, missing inference markers,
unverified bundle size estimates, and a gap in the §11 risk register regarding the error boundary
pattern described in §08.

---

## Critical Findings

### CR-1: §02 Perpetuates Incorrect MUI 6 React Version Requirement

- **Agents:** Source Traceability Auditor, Library Alignment Agent
- **Affected sections:** `docs/arc42/02-constraints.md` (line 17), `docs/arc42/04-solution-strategy.md` (line 15)
- **Description:** §02 Constraints states in the technical constraints table:
  > "**Frontend framework: React 18+** | Specified in `SPEC.md` §Technische Basis. **Required for MUI 6.**"

  §04 Solution Strategy repeats the claim in the technology table:
  > "React 18+ | … required for MUI 6."

  This is factually incorrect. The `@mui/material` v6 package lists its peer dependency as
  `"react": "^17.0.0 || ^18.0.0 || ^19.0.0"`. MUI 6 explicitly supports React 17, 18, and 19;
  React 18 is not a prerequisite. A developer reading §02 could incorrectly infer that they
  cannot use React 17 or 19 with MUI 6, or that downgrading to React 17 would break the UI library.

- **Evidence:**
  - `docs/arc42/02-constraints.md` line 17: "Required for MUI 6."
  - `docs/arc42/04-solution-strategy.md` line 15: "required for MUI 6."
  - `SourceDocuments/adr/005-technology-stack-rationale.md` (the origin of the claim): "MUI 6
    targets React 18+. Choosing React 18+ is a prerequisite for using MUI 6."
  - MUI 6 npm peer dependencies (verified against `@mui/material` package source): `"react":
    "^17.0.0 || ^18.0.0 || ^19.0.0"`
  - This finding was identified as C-2 in `architecture/adr-consistency-review.md` but was
    **not incorporated** into the arc42 sections.

- **Recommended action:** In §02, change the React 18+ rationale column to:
  > "Specified in `SPEC.md` §Technische Basis. MUI 6 is compatible with React 17, 18, and 19;
  > React 18 is chosen specifically for concurrent rendering features (`useTransition`,
  > `useDeferredValue`). See ADR-005."

  In §04 technology table, change "required for MUI 6" to "chosen for concurrent rendering
  (`useTransition`, `useDeferredValue`) and MUI 6 compatibility. See ADR-005."

---

## Important Findings

### IMP-1: §05 Level 1 and Level 2 Mermaid Diagrams Disagree on YamlEditorDialog Ownership

- **Agents:** Cross-Reference Validator
- **Affected sections:** `docs/arc42/05-building-block-view.md` (lines 17–26 and lines 52–68)
- **Description:** The Level 1 and Level 2 decomposition diagrams within §05 show different
  structural positions for `YamlEditorDialog`:

  **Level 1 diagram** (lines 17–26):
  ```
  FormEditor --> YamlEditorDialog
  ```
  This implies `YamlEditorDialog` is a direct child component of `FormEditor`.

  **Level 2 diagram** (lines 52–68):
  ```
  SectionAccordion --> YamlEditorDialog
  ```
  This implies `YamlEditorDialog` is rendered by `SectionAccordion`.

  **Body text** (line 78):
  > "2 sections (`NetworkSection`, `StorageActionSection`) render a trigger button that opens
  > `YamlEditorDialog`."

  This is a third, different ownership model: the `[Section]Form` components trigger the dialog,
  not `FormEditor` or `SectionAccordion`. The Level 2 diagram connects `SectionAccordion →
  YamlEditorDialog`, but the text is clear that specific `SectionForm` components (not the
  Accordion wrapper) contain the button that opens the dialog.

- **Evidence:**
  - §05 Level 1 Mermaid, line 25: `FormEditor --> YamlEditorDialog`
  - §05 Level 2 Mermaid, line 67: `SectionAccordion --> YamlEditorDialog`
  - §05 body text, line 78: "`NetworkSection` and `StorageActionSection` render a trigger button"
  - §06 Scenario 2 (runtime view): `NetworkSection (or StorageActionSection)` opens the dialog

- **Recommended action:** Correct the Level 2 diagram to replace `SectionAccordion -->
  YamlEditorDialog` with `SectionForm --> YamlEditorDialog`. The Level 1 diagram is a
  high-level simplification (`FormEditor` contains it transitively) and can remain, but add
  a note: "YamlEditorDialog is opened by specific section form components (NetworkSection,
  StorageActionSection); see Level 2 for detail."

---

### IMP-2: §02 and §07 Contain Stale Vite Technology Claims

- **Agents:** Source Traceability Auditor, Library Alignment Agent
- **Affected sections:** `docs/arc42/02-constraints.md` (line 44), `docs/arc42/07-deployment-view.md` (line 103)
- **Description:** Two Vite-related claims in the arc42 sections are stale or incorrect:

  **Claim A — §02, line 44:**
  > "Build target: Vite's default esbuild target (ES2015+), which aligns with this browser matrix."

  Vite 6's default production build target was modern browsers (Chrome 87+, Firefox 78+, Safari
  14+, Edge 88+) — above ES2015, not ES2015 itself. ES2015 is the minimum configurable floor,
  not the default. Additionally, Vite production builds use Rollup (Vite 6) or Rolldown (Vite
  8+), not esbuild; esbuild is used only for development-mode transpilation.

  As of Vite 8 (released March 12, 2026 — 19 days before the arc42 was drafted on March 31,
  2026), the default target is `'baseline-widely-available'` (Chrome 111, Edge 111, Firefox 114,
  Safari 16.4) and transpilation uses the Oxc Transformer, not esbuild.

  **Claim B — §07, line 103:**
  > "Vite uses Rollup for production builds."

  This was accurate for Vite 5 and 6. Vite 8 switched to Rolldown as the default production
  bundler. This claim is stale if the project uses Vite 8+.

- **Evidence:**
  - `docs/arc42/02-constraints.md` line 44: "Vite's default esbuild target (ES2015+)"
  - `docs/arc42/07-deployment-view.md` line 103: "Vite uses Rollup for production builds"
  - `SourceDocuments/adr/002-build-tooling-and-deployment.md`: Same claims appear in ADR-002
  - These findings were identified as I-2 and I-3 in `architecture/adr-consistency-review.md`
    but were **not incorporated** into the arc42 sections.
  - Vite 8 documentation: default target is `baseline-widely-available`; production bundler is
    Rolldown.

- **Recommended action:**
  - §02: Change to "Build target: Vite's default production target (modern evergreen browsers;
    Chrome 87+, Firefox 78+, Safari 14+, Edge 88+ for Vite 6; `baseline-widely-available` for
    Vite 8+), which aligns with the evergreen browser support matrix. (ADR-002)"
  - §07 §7.4: Change "Vite uses Rollup for production builds" to "Vite uses Rollup for production
    builds (Vite 6) / Rolldown (Vite 7+)."
  - Flag this as a **workflow advisory**: the ADR consistency review (I-2, I-3) identified these
    findings, but the recommended fix to ADR-002 was not propagated to the arc42 sections. The
    ADR fix and arc42 fix should be applied together.

---

### IMP-3: LCP Abbreviation Used Without Expansion in §01

- **Agents:** Terminology Consistency Agent
- **Affected sections:** `docs/arc42/01-introduction-and-goals.md` (line 60)
- **Description:** The §01 Quality Goals table uses `LCP` without expanding it:
  > "Initial page load LCP < 2 s on 4G."

  The expansion "Largest Contentful Paint (LCP)" only appears in §10 Quality Requirements at
  line 72, inside a quality scenario table row. Readers encountering §01 first would not know
  what LCP means without consulting §10 or §12 (where it is not defined — the §12 Glossary
  does not include LCP).

- **Evidence:**
  - `docs/arc42/01-introduction-and-goals.md` line 60: "Initial page load LCP < 2 s on 4G"
  - `docs/arc42/10-quality-requirements.md` line 72: "Largest Contentful Paint (LCP) renders"
  - `docs/arc42/12-glossary.md`: LCP is not defined in the glossary

- **Recommended action:** In §01 Quality Goals table, change to:
  > "Initial page load (Largest Contentful Paint / LCP) < 2 s on 4G."
  Add LCP to the §12 Glossary "Additional Terms" table.

---

### IMP-4: Source Document Inconsistency — resolved-questions.md Q-1 Not Updated

- **Agents:** Source Traceability Auditor
- **Affected sections:** `architecture/questions/resolved-questions.md` (Q-1 impact statement);
  `docs/arc42/05-building-block-view.md` is **correct** but was generated from an inconsistent source
- **Description:** `resolved-questions.md` Q-1's Arc42 Impact section still reads:
  > "§05: `YamlEditorDialog` component must appear in the building block view; **3 sections use it
  > (Network, Storage Action, User-Data)**"

  ADR-001 decided that User-Data uses a **structured form** (not a YAML editor escape hatch),
  scoping the escape hatch to exactly 2 sections. This is correctly reflected in §05, which states:
  > "Used by exactly **2 sections**: Network (Netplan YAML) and Storage Action mode."

  The arc42 §05 is correct. However, `resolved-questions.md` — the upstream source from which
  §05 was drafted — remains inconsistent. If §05 is ever regenerated from `resolved-questions.md`,
  this inconsistency will reintroduce the error. This finding was identified as C-1 in the ADR
  consistency review but was **not corrected** in the source document.

- **Evidence:**
  - `architecture/questions/resolved-questions.md` Q-1 impact: "3 sections use it"
  - `SourceDocuments/adr/001-hybrid-ui-model.md` Arc42 Impact table: "2 sections use it"
  - `docs/arc42/05-building-block-view.md` line 37: "Used by exactly 2 sections"
  - `architecture/adr-consistency-review.md` C-1: Finding identified but not actioned

- **Recommended action:** Update `architecture/questions/resolved-questions.md` Q-1 impact
  statement to read: "§05: `YamlEditorDialog` component must appear in the building block view;
  **2 sections use it** (Network, Storage Action mode); User-Data uses a structured form scoped
  to the cloud-init `users` module." **Note:** This is a fix to a source document, not to an
  arc42 section — but it is required to protect arc42 §05 correctness through future revisions.
  Flagged here because it represents a coordination risk.

---

## Advisory Findings

### ADV-1: Section Count Terminology Ambiguity (24 vs. 26)

- **Agents:** Cross-Reference Validator, Source Traceability Auditor
- **Affected sections:** `docs/arc42/01-introduction-and-goals.md` (line 23),
  `docs/arc42/04-solution-strategy.md` (line 57)
- **Description:** §01 refers to "approximately 24 Autoinstall sections" in the in-scope list,
  while §04 refers to "26 Autoinstall form sections" in the Tab group description. The two
  numbers are not contradictory (24 structured forms + 2 YAML editor escape hatches = 26 total),
  but the distinction is only implicit. Readers who encounter §01 first may wonder if §04's "26"
  contradicts §01's "24."
- **Recommended action:** In §01 scope table, change "Structured form UI covering approximately
  24 Autoinstall sections" to "Structured form UI covering approximately 24 Autoinstall sections;
  2 additional sections use YAML editor escape hatches (Network, Storage Action mode) — 26
  sections total."

---

### ADV-2: React 18 Hook References Vary Across Sections

- **Agents:** Cross-Reference Validator, Source Traceability Auditor
- **Affected sections:** `docs/arc42/04-solution-strategy.md` (line 15 and line 115),
  `docs/arc42/06-runtime-view.md` (line 42), `docs/arc42/09-architecture-decisions.md` (line 119)
- **Description:** Different sections emphasize different React 18 hooks for YAML preview
  performance:
  - §04 technology table: "`useTransition` for live preview (`useDeferredValue`)"
  - §04 data strategy: "`useDeferredValue` **or** `useTransition`"
  - §06 Scenario 1: only `useDeferredValue` mentioned
  - §09 ADR-005 summary: "`useTransition` for live preview debouncing"

  There is no technical contradiction (both hooks are valid; `useDeferredValue` is value-based
  deferral; `useTransition` is action-based transition). However, the inconsistency may confuse
  implementers about which hook to use.
- **Recommended action:** Standardize on one formulation in §04, §06, and §09. The technically
  more precise choice is `useDeferredValue` for deferring a derived value (the YAML string from
  the config state), which is the pattern shown in §06. Update §09's "live preview debouncing"
  framing to reference `useDeferredValue` for consistency.

---

### ADV-3: PrismJS Bundle Size Caveat Not Propagated from ADR-003

- **Agents:** Source Traceability Auditor, Library Alignment Agent
- **Affected sections:** `docs/arc42/04-solution-strategy.md` (line 22),
  `docs/arc42/08-crosscutting-concepts.md` (line 172)
- **Description:** ADR-003 states its bundle size figures (~8 KB for PrismJS YAML grammar,
  ~5 KB for theme, ~13 KB total) with a caveat: "context7 is not available in this environment.
  The bundle size figures… are based on… analysis… as of 2025." The ADR review identified these
  as unverifiable (A-8). The figures have not been independently verified against current bundle
  analysis. However, §04 and §08 repeat these figures without any "estimated" qualifier.
- **Recommended action:** In §04 technology table row for `react-syntax-highlighter`: add
  "(estimated)" after "~13 KB gzipped." In §08 Syntax Highlighting section, add a note:
  "Bundle contribution figures (~13 KB) are estimated; verify with `vite build --report` after
  initial implementation."

---

### ADV-4: Inference Markers Missing in §02 and §04 for Target Audience

- **Agents:** Source Traceability Auditor
- **Affected sections:** `docs/arc42/02-constraints.md` (line 36),
  `docs/arc42/04-solution-strategy.md` (line 56)
- **Description:** §02 states "The target audience (Ubuntu sysadmins, DevOps engineers) uses
  modern browsers" without an inference marker. §04 states "the target audience: expert
  sysadmins and DevOps engineers" without a marker. Both statements are valid derivations from
  the application's purpose, but SPEC.md §Ziel der Anwendung does not explicitly name these
  user roles. §01 correctly marks the stakeholder table with "⚠️ Inferred" — the same qualifier
  should appear in §02 and §04. ADR-004 also cites this as explicit SPEC.md content (I-4 in
  ADR consistency review), which is incorrect.
- **Recommended action:** In §02 §2.2 and §04 §4.2, add "(inferred from application purpose)"
  after the first mention of "sysadmins / DevOps engineers."

---

### ADV-5: Five Abbreviations Not Expanded on First Use Across Sections

- **Agents:** Terminology Consistency Agent
- **Affected sections:** Multiple — see detail below
- **Description:** The following abbreviations are defined in §12 Glossary but are used without
  expansion on first use in their respective sections. The glossary is the correct long-term
  definition, but each section should be self-contained on first use.

  | Abbreviation | Full form | First unexpanded use |
  |-------------|-----------|----------------------|
  | HMR | Hot Module Replacement | §04 line 23: "fast HMR, Rollup tree-shaking" |
  | HMR | Hot Module Replacement | §07 line 45: "HMR enabled" |
  | WAI-ARIA | Web Accessibility Initiative – Accessible Rich Internet Applications | §01 line 62 |
  | WCAG | Web Content Accessibility Guidelines | §01 line 62 |
  | SLO | Service Level Objective | §01 line 65: "quantitative SLOs" |
  | ESM | ECMAScript Modules | §08 line 221: "native ESM serving" |

  LCP is listed separately as IMP-3 due to higher severity (not in glossary either).

- **Recommended action:** On the first occurrence of each abbreviation in each section, add
  the expansion in parentheses. Example: "fast Hot Module Replacement (HMR)." This is a
  low-effort edit that meaningfully improves self-contained readability.

---

### ADV-6: §08 Code Example Missing zodResolver Import Subpath

- **Agents:** Library Alignment Agent
- **Affected sections:** `docs/arc42/08-crosscutting-concepts.md` (lines 72–79)
- **Description:** The §08 Form Handling section shows a code example using `zodResolver`:
  ```typescript
  const { register, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
  ```
  The `zodResolver` function is not imported in the snippet. The correct import is:
  ```typescript
  import { zodResolver } from '@hookform/resolvers/zod';
  ```
  The `/zod` subpath is required; `@hookform/resolvers` alone does not export `zodResolver`
  as a named top-level export. A developer copying the snippet would encounter a module
  resolution error.
- **Recommended action:** Add the import statement to the top of the code example in §08:
  `import { zodResolver } from '@hookform/resolvers/zod';`

---

### ADV-7: Storage Layout/Action Mode Toggle Mechanism Not Described in §05

- **Agents:** Source Traceability Auditor
- **Affected sections:** `docs/arc42/05-building-block-view.md` (Storage tab group entry)
- **Description:** §05's tab group contents table shows Storage with two sub-modes (Layout mode
  radio group and Action mode YamlEditorDialog), but does not describe the UI mechanism for
  switching between them. ADR-001 calls this "a design detail, not an architectural constraint,"
  and ADR-004 lists the Storage group without navigation strategy for the toggle. An implementer
  reading §05 knows *that* two modes exist but not *how* the user switches between them. This
  leaves a gap between §05 (what exists) and §06 (which has no scenario for mode switching in
  the Storage section).
- **Recommended action:** Add a note in §05 under the Storage tab group entry: "The user
  switches between Layout mode and Action mode via a toggle control within the Storage section
  (e.g., a Switch or radio group labelled 'Use action list instead of layout'). The specific
  toggle UI is an implementation detail to be decided during component development."

---

### ADV-8: Error Boundary Not Tracked in §11 Technical Debt Register

- **Agents:** Source Traceability Auditor
- **Affected sections:** `docs/arc42/08-crosscutting-concepts.md` (lines 246–250),
  `docs/arc42/11-risks-and-technical-debt.md`
- **Description:** §08 Error Handling section correctly flags an inferred item:
  > "A React error boundary (`componentDidCatch`) should be added as a safety net…
  > ⚠️ Inferred: Error boundary is not specified in the source documents."

  However, §11 Technical Debt Register (TD-1 through TD-3) does not include the error boundary
  as a tracked debt item. A design gap identified in §08 should be either addressed in the
  implementation or tracked in §11 so it is not lost.
- **Recommended action:** Add a TD-4 entry in §11: "**TD-4: No Error Boundary Defined** —
  §08 identifies a React error boundary (`componentDidCatch`) as recommended for production use.
  Not specified in source documents; not in any ADR. Add a React ErrorBoundary component as a
  v1 safety net."

---

### ADV-9: §00 Source Inventory ADR Count Is Stale

- **Agents:** Source Traceability Auditor
- **Affected sections:** `docs/arc42/00-source-inventory.md` (line 15)
- **Description:** The §00 source inventory summary table shows:
  > "| ADRs | 0 |"

  Five ADRs exist in `SourceDocuments/adr/` (ADR-001 through ADR-005), all dated 2026-03-31.
  The arc42 sections correctly reference these ADRs, but the source inventory was not updated
  after the ADRs were written. The inventory also lacks an ADR section in its Document Catalog.
- **Recommended action:** Update §00 to change ADR count from 0 to 5, and add an ADR section
  to the Document Catalog listing ADR-001 through ADR-005 with their titles, status, and
  arc42 section mappings.

---

## Library Validation Matrix

| Section | Technology | Claim | context7 / Web Finding | Status |
|---------|-----------|-------|------------------------|--------|
| §02 | MUI 6 | "Required for MUI 6" (React 18+) | Peer dep: `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` — React 17 and 19 both supported | **Incorrect** |
| §02, §07 | Vite | "default esbuild target (ES2015+)" | Default is `baseline-widely-available` (Chrome 87+/111+); ES2015 is min floor; esbuild is dev-mode only | **Outdated** |
| §07 | Vite | "Vite uses Rollup for production builds" | Rollup used in Vite 5/6; Vite 8 switched to Rolldown | **Outdated** |
| §08 | react-syntax-highlighter | `import { Prism as SyntaxHighlighter }` and `/dist/esm/styles/prism` import path | Confirmed correct per official README | **Confirmed** |
| §08 | React Hook Form | `mode: 'onChange'` as valid option | Valid; confirmed values: `onChange`, `onBlur`, `onSubmit`, `onTouched`, `all` | **Confirmed** |
| §08 | React Hook Form | `watch()` with `useEffect` pattern | Valid documented pattern | **Confirmed** |
| §08 | @hookform/resolvers | `zodResolver(schema)` usage | Confirmed; requires `/zod` subpath import (gap noted in ADV-6) | **Confirmed** |
| §08 | yaml npm package | `yaml.stringify()` API | Confirmed for both default and named import styles | **Confirmed** |
| §08 | yaml npm package | `undefined` fields omitted automatically | Confirmed; `keepUndefined: true` overrides | **Confirmed** |
| §04, §08 | PrismJS | "~8 KB gzipped" YAML grammar + "~5 KB" theme = "~13 KB total" | ADR-003 acknowledges estimate; bundle analysis not published in PrismJS docs | **Unverifiable** |
| §03, §07 | GitHub Pages | Free for public repos; HTTPS enforced; no server-side execution | All three claims confirmed | **Confirmed** |
| §06, §02 | Clipboard API | Requires HTTPS; available on localhost | Confirmed by MDN; baseline widely available since 2020 | **Confirmed** |
| §04, §06 | React 18 | `useTransition` / `useDeferredValue` for deferred YAML preview | Both hooks confirmed in React 18 docs | **Confirmed** |

---

## Source Traceability Matrix

| Section | Source Claims Expected (from §00) | Coverage in Arc42 | Untraced Claims | Missing Claims |
|---------|----------------------------------|-------------------|-----------------|----------------|
| §01 | 5 (goal, coverage, YAML, stakeholders, normative refs) | All 5 incorporated | 0 | 0 |
| §02 | 8 (tech stack constraints) | All 8 incorporated; React 18 rationale incorrect (CR-1) | 0 | 1 (incorrect) |
| §03 | 5 (SPA, client-side, external boundaries) | All 5 incorporated | 0 | 0 |
| §04 | 6 (UX, layout, YAML, validation, SPA, escape hatches) | All 6 incorporated | 0 | 0 |
| §05 | 9 (pages, nav, sections, components, model, schema) | All 9 incorporated | 0 | 0 |
| §06 | 5 (form→YAML, download, clipboard, client-side) | All 5 incorporated | 0 | 0 |
| §07 | 0 (no source coverage) | Fully drafted from ADR-002 | 0 | 0 |
| §08 | 7 (global state, validation, form handling) | All 7 incorporated | 0 | 0 |
| §09 | 8 tech choices (rationale inferred) | All incorporated via ADRs | 0 | 0 |
| §10 | 5 (coverage, responsive, preview, validation) | All incorporated | 0 | 0 |
| §11 | 4 risks (inferred) | All incorporated + 3 tech debt items | 0 | 1 (error boundary per ADV-8) |
| §12 | 8 domain terms | All 8 terms defined | 0 | 0 |

---

## Terminology Report

| Issue Type | Count | Most Affected Sections |
|-----------|-------|----------------------|
| Abbreviation — not expanded on first use | 6 (LCP, HMR, WAI-ARIA, WCAG, SLO, ESM) | §01, §02, §04, §07, §08 |
| Missing inference markers | 2 ("sysadmins/DevOps" in §02, §04) | §02, §04 |
| Synonym drift | 0 | — |
| Glossary orphans | 0 | — |
| Undefined domain terms | 0 | — |
| Naming mismatches with ADRs | 0 | — |

**Positive terminology findings:** `YamlEditorDialog`, "escape hatch", "structured form",
"Form Editor", "YAML Preview panel", "Autoinstall" (capitalized), `` `autoinstall.yaml` ``,
"v1"/"v2", and all ADR-aligned component names are used consistently throughout all sections.

---

## Cross-Section Dependency Map

| Section pair | Reference direction | Consistent? |
|-------------|---------------------|-------------|
| §01 ↔ §02 | §01 → §02 (constraints); §02 → §04 (rationale) | ✓ |
| §01 ↔ §03 | §01 → §03 (system boundary); §03 → §01 (goals) | ✓ |
| §01 ↔ §10 | §01 → §10 (quantitative SLOs); §10 → §01 (quality goals) | ✓ |
| §02 ↔ §06 | §02 → §06 (Clipboard API fallback); §06 → §02 (browser constraint) | ✓ |
| §04 ↔ §05 | §04 → §05 (component structure); §05 → §04 (rationale) | ✓ |
| §04 ↔ §08 | §04 → §08 (crosscutting patterns); §08 → §04 (strategy) | ✓ |
| §05 ↔ §06 | §05 → §06 (scenarios); §06 → §05 (component ownership) | ⚠️ Partial — §05 Level 2 diagram inconsistency (IMP-1) |
| §05 ↔ §11 | §11 → §05 (YamlEditorDialog risks); §05 → §11 | ⚠️ Asymmetric — §05 does not cross-reference §11 |
| §07 ↔ §08 | §07 → §08 (dev experience); §08 → §07 (deployment) | ✓ |
| §09 ↔ all | §09 references all sections via ADR impacts; all reference §09 | ✓ |
| §11 ↔ §03 | §11 → §03 (schema drift); §03 → §11 (schema drift risk) | ⚠️ Asymmetric — §11 does not reference §03 |

---

## Coordination Issues

### Coordination Issue 1: MUI 6 / React 18 Fix Requires Aligned ADR + Arc42 Update

Fixing CR-1 (§02 "Required for MUI 6") also requires updating ADR-005, which is the origin of
the claim. Fixing only §02 and §04 without updating ADR-005 creates a new inconsistency between
the arc42 (corrected) and its source ADR (still incorrect). The ADR consistency review (C-2)
already recommended the ADR fix; the arc42 fix should be applied in the same change.

**Recommended workflow step:** Run `/architecture:review-adr-consistency` after correcting
ADR-005, then apply the correction to §02 and §04 in the same commit.

### Coordination Issue 2: Vite Claims Require Aligned ADR-002 + Arc42 Update

Fixing IMP-2 (§02 and §07 Vite claims) also requires updating ADR-002, which is the source of
the same claims. The ADR consistency review (I-2, I-3) recommended the ADR fix, which was not
propagated to the arc42. Both the ADR and arc42 sections must be corrected together.

**Recommended workflow step:** Update ADR-002 first (correct Vite build target and bundler
descriptions), then re-derive §02 and §07 from the corrected ADR.

### Coordination Issue 3: resolved-questions.md Q-1 Fix Does Not Affect arc42 §05

IMP-4 (Q-1 source document says 3 sections) does not require changing §05 — §05 is already
correct. But the source document fix should be applied before the next architecture question
resolution cycle to avoid re-introducing the error into any future §05 revision.

**Recommended workflow step:** Update `architecture/questions/resolved-questions.md` Q-1
immediately (standalone fix); no arc42 section changes required.
