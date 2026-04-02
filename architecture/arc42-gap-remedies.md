# Arc42 Gap Remedies

**Generated:** 2026-04-02
**Findings resolved:** 14 of 14
**Findings requiring workflow loops:** 0
**Source gaps (unresolvable):** 0

---

## Remedy Summary

| Finding | Severity | Remedy Type | Applied? | Notes |
|---------|----------|-------------|----------|-------|
| CR-1 | Critical | cross-section-sync | Yes | §02 + §04 corrected; ADR-005 note added |
| IMP-1 | Important | section-fix | Yes | Level 2 diagram corrected; Level 1 note added |
| IMP-2 | Important | section-fix | Yes | §02 + §07 updated; ADR-002 workflow advisory noted |
| IMP-3 | Important | section-fix + section-addition | Yes | §01 LCP expanded; §12 LCP entry added |
| IMP-4 | Important | section-fix | Yes | resolved-questions.md Q-1 impact corrected |
| ADV-1 | Advisory | section-fix | Yes | §01 scope table clarified (24+2=26) |
| ADV-2 | Advisory | cross-section-sync | Yes | §04 + §09 standardized on `useDeferredValue` |
| ADV-3 | Advisory | section-fix | Yes | §04 + §08 "estimated" qualifier added |
| ADV-4 | Advisory | section-fix | Yes | §02 + §04 inference markers added |
| ADV-5 | Advisory | section-fix | Yes | HMR, ESM, WAI-ARIA, WCAG, SLO expanded on first use in §01, §04, §07, §08 |
| ADV-6 | Advisory | section-fix | Yes | `zodResolver` import added to §08 code example |
| ADV-7 | Advisory | section-addition | Yes | Storage toggle mechanism described in §05 |
| ADV-8 | Advisory | section-addition | Yes | TD-4 Error Boundary added to §11 |
| ADV-9 | Advisory | section-fix | Yes | §00 ADR count corrected to 5; ADR catalog added |

---

## Applied Fixes

### CR-1: §02 Perpetuates Incorrect MUI 6 React Version Requirement

- **Severity:** Critical
- **Affected sections:** §02 — `docs/arc42/02-constraints.md`, §04 — `docs/arc42/04-solution-strategy.md`
- **Remedy type:** cross-section-sync
- **What was changed:**
  - §02 Technical Constraints table: replaced "Specified in `SPEC.md` §Technische Basis. Required for MUI 6." with "MUI 6 is compatible with React 17, 18, and 19; React 18 is chosen specifically for concurrent rendering features (`useTransition`, `useDeferredValue`). See ADR-005."
  - §04 Technology table: replaced "concurrent rendering for live preview (`useTransition`); required for MUI 6." with "chosen for concurrent rendering (`useTransition`, `useDeferredValue`) and MUI 6 compatibility (MUI 6 supports React 17, 18, and 19)."
- **Evidence:** MUI 6 npm peer dependency: `"react": "^17.0.0 || ^18.0.0 || ^19.0.0"`. Finding C-2 in `architecture/adr-consistency-review.md`.
- **Coordination note:** ADR-005 itself (`SourceDocuments/adr/005-technology-stack-rationale.md`) still contains the original incorrect claim. That ADR should be updated to align with the corrected arc42 sections. Run `/architecture:review-adr-consistency` after updating ADR-005.

---

### IMP-1: §05 Level 1 and Level 2 Mermaid Diagrams Disagree on YamlEditorDialog Ownership

- **Severity:** Important
- **Affected section:** §05 — `docs/arc42/05-building-block-view.md`
- **Remedy type:** section-fix
- **What was changed:**
  - Level 2 diagram: replaced `SectionAccordion --> YamlEditorDialog` with `SectionForm --> YamlEditorDialog`. This correctly reflects that specific `[Section]Form` components (NetworkSection, StorageActionSection) contain the button that opens the dialog, not the Accordion wrapper.
  - Level 1 diagram: added a note below the diagram block clarifying that `FormEditor --> YamlEditorDialog` is a transitive containment relationship, not direct ownership. The note references Level 2 for precise ownership.
- **Evidence:** §05 body text (line 78): "2 sections (`NetworkSection`, `StorageActionSection`) render a trigger button that opens `YamlEditorDialog`." §06 Scenario 2 confirms the same components open the dialog.

---

### IMP-2: §02 and §07 Contain Stale Vite Technology Claims

- **Severity:** Important
- **Affected sections:** §02 — `docs/arc42/02-constraints.md`, §07 — `docs/arc42/07-deployment-view.md`
- **Remedy type:** section-fix
- **What was changed:**
  - §02 §2.2: replaced "Build target: Vite's default esbuild target (ES2015+), which aligns with this browser matrix." with an accurate multi-version description specifying the modern browser target for Vite 6 and `baseline-widely-available` for Vite 8+; clarified that esbuild is development-mode only and production builds use Rollup/Rolldown.
  - §07 §7.4: replaced "Vite uses Rollup for production builds." with "Vite uses Rollup for production builds (Vite 5/6) / Rolldown (Vite 7+)."
- **Evidence:** Vite 8 documentation: default target is `baseline-widely-available`; production bundler switched to Rolldown. ADR consistency review findings I-2 and I-3.
- **Workflow advisory:** ADR-002 (`SourceDocuments/adr/002-build-tooling-and-deployment.md`) contains the same stale claims (I-2, I-3 in the ADR consistency review). The ADR should be updated to align with the corrected arc42 sections in the same commit.

---

### IMP-3: LCP Abbreviation Used Without Expansion in §01

- **Severity:** Important
- **Affected sections:** §01 — `docs/arc42/01-introduction-and-goals.md`, §12 — `docs/arc42/12-glossary.md`
- **Remedy type:** section-fix + section-addition
- **What was changed:**
  - §01 Quality Goals table: changed "Initial page load LCP < 2 s on 4G" to "Initial page load (Largest Contentful Paint / LCP) < 2 s on 4G".
  - §12 Glossary Additional Terms table: added new LCP entry: "Largest Contentful Paint — a Core Web Vitals metric that measures the render time of the largest image or text block visible in the viewport. A 'Good' LCP score is < 2.5 seconds. This application targets < 2 s on a 4G connection."
- **Evidence:** §10 line 72 already used the expanded form "Largest Contentful Paint (LCP) renders"; §12 had no LCP entry before this fix.

---

### IMP-4: Source Document Inconsistency — resolved-questions.md Q-1 Not Updated

- **Severity:** Important
- **Affected file:** `architecture/questions/resolved-questions.md` (Q-1 Arc42 Impact section)
- **Remedy type:** section-fix (source document, not arc42 section)
- **What was changed:** Q-1 Arc42 Impact bullet updated from "3 sections use it (Network, Storage Action, User-Data)" to "**2 sections use it** (Network, Storage Action mode); User-Data uses a structured form scoped to the cloud-init `users` module".
- **Evidence:** ADR-001 decided that User-Data uses a structured form. §05 already correctly stated "Used by exactly 2 sections." The upstream source document was out of sync. ADR consistency review finding C-1.

---

### ADV-1: Section Count Terminology Ambiguity (24 vs. 26)

- **Severity:** Advisory
- **Affected section:** §01 — `docs/arc42/01-introduction-and-goals.md`
- **Remedy type:** section-fix
- **What was changed:** §01 Scope table bullet extended from "approximately 24 Autoinstall sections" to "approximately 24 Autoinstall sections; 2 additional sections use YAML editor escape hatches (Network, Storage Action mode) — 26 sections total." This resolves the apparent contradiction with §04's reference to "26 Autoinstall form sections".
- **Evidence:** §01 (24) and §04 (26) are reconcilable: 24 structured + 2 escape hatches = 26 total. ADR-001.

---

### ADV-2: React 18 Hook References Vary Across Sections

- **Severity:** Advisory
- **Affected sections:** §04 — `docs/arc42/04-solution-strategy.md`, §09 — `docs/arc42/09-architecture-decisions.md`
- **Remedy type:** cross-section-sync
- **What was changed:**
  - §04 §4.3 Data Strategy: replaced "React 18's `useDeferredValue` or `useTransition` can be applied to the YAML re-render" with a precise statement that `useDeferredValue` is the appropriate hook for deferring a derived value (the YAML string), with an explanation distinguishing it from `useTransition` (action-based transitions).
  - §09 ADR-005 summary table: replaced "`useTransition` for live preview debouncing" with "`useDeferredValue` for deferring YAML preview re-renders on value change".
- **Evidence:** `useDeferredValue` defers a derived value; `useTransition` marks state updates as transitions. The YAML string is derived from form state, making `useDeferredValue` the technically precise choice. §06 Scenario 1 already used only `useDeferredValue`.

---

### ADV-3: PrismJS Bundle Size Caveat Not Propagated from ADR-003

- **Severity:** Advisory
- **Affected sections:** §04 — `docs/arc42/04-solution-strategy.md`, §08 — `docs/arc42/08-crosscutting-concepts.md`
- **Remedy type:** section-fix
- **What was changed:**
  - §04 Technology table: added "(estimated; verify with `vite build --report`)" after "~13 KB gzipped" for `react-syntax-highlighter`.
  - §08 Syntax Highlighting section: added "(estimated; verify with `vite build --report` after initial implementation)" after "~13 KB total".
- **Evidence:** ADR-003 acknowledges figures are estimates based on 2025 analysis without independent verification. ADR consistency review finding A-8.

---

### ADV-4: Inference Markers Missing in §02 and §04 for Target Audience

- **Severity:** Advisory
- **Affected sections:** §02 — `docs/arc42/02-constraints.md`, §04 — `docs/arc42/04-solution-strategy.md`
- **Remedy type:** section-fix
- **What was changed:**
  - §02 §2.2: changed "The target audience (Ubuntu sysadmins, DevOps engineers) uses modern browsers" to "The target audience (Ubuntu sysadmins, DevOps engineers — inferred from application purpose) uses modern browsers".
  - §04 §4.2: added "(inferred from application purpose)" after "expert sysadmins and DevOps engineers".
- **Evidence:** SPEC.md §Ziel der Anwendung does not explicitly name "sysadmins" or "DevOps engineers". §01 stakeholder table correctly uses "⚠️ Inferred". ADR consistency review finding I-4.

---

### ADV-5: Five Abbreviations Not Expanded on First Use Across Sections

- **Severity:** Advisory
- **Affected sections:** §01, §04, §07, §08
- **Remedy type:** section-fix
- **What was changed:**
  - §01 Quality Goals: expanded "WCAG" to "Web Content Accessibility Guidelines (WCAG)" and "WAI-ARIA" to "Web Accessibility Initiative – Accessible Rich Internet Applications (WAI-ARIA)".
  - §01 Quality Goals cross-reference: expanded "SLOs" to "Service Level Objectives (SLOs)".
  - §04 Technology table: expanded "ESM" to "ECMAScript Modules (ESM)" and "HMR" to "Hot Module Replacement (HMR)".
  - §07 Environments table: expanded "HMR" to "Hot Module Replacement (HMR)".
  - §08 Development Experience: expanded "HMR" to "Hot Module Replacement (HMR)" in the section pattern line.
- **Evidence:** All terms are defined in §12 Glossary but were not expanded on first use in their respective sections. LCP was handled separately under IMP-3.

---

### ADV-6: §08 Code Example Missing zodResolver Import Subpath

- **Severity:** Advisory
- **Affected section:** §08 — `docs/arc42/08-crosscutting-concepts.md`
- **Remedy type:** section-fix
- **What was changed:** Added `import { zodResolver } from '@hookform/resolvers/zod';` as the first line of the Form Handling code example. Without this import, the snippet cannot compile — `@hookform/resolvers` alone does not export `zodResolver` as a top-level named export.
- **Evidence:** `@hookform/resolvers` package requires the `/zod` subpath to access `zodResolver`. Confirmed per official `@hookform/resolvers` README.

---

### ADV-7: Storage Layout/Action Mode Toggle Mechanism Not Described in §05

- **Severity:** Advisory
- **Affected section:** §05 — `docs/arc42/05-building-block-view.md`
- **Remedy type:** section-addition
- **What was changed:** Extended the Storage tab group entry in the Tab Group Contents table for the Action mode row to include a parenthetical description of the toggle mechanism: "via a Switch or radio group labelled 'Use action list instead of layout'; implementation detail to be decided during component development".
- **Evidence:** ADR-001 calls the toggle "a design detail, not an architectural constraint." The description acknowledges both that the mechanism exists and that its exact form is deferred.

---

### ADV-8: Error Boundary Not Tracked in §11 Technical Debt Register

- **Severity:** Advisory
- **Affected section:** §11 — `docs/arc42/11-risks-and-technical-debt.md`
- **Remedy type:** section-addition
- **What was changed:** Added TD-4 "No Error Boundary Defined" entry to the Technical Debt Register. The entry describes why the debt exists (no async operations in v1; not specified in source documents), the cost of keeping it (white-screen failures for unexpected runtime errors), and the clear path to resolution (add a single `ErrorBoundary` class component wrapping `<App>`).
- **Evidence:** §08 Error Handling already flagged this as "⚠️ Inferred" but §11 did not track it as a debt item.

---

### ADV-9: §00 Source Inventory ADR Count Is Stale

- **Severity:** Advisory
- **Affected section:** §00 — `docs/arc42/00-source-inventory.md`
- **Remedy type:** section-fix + section-addition
- **What was changed:**
  - Summary Statistics table: ADR count updated from 0 to 5; total updated from 1 to 6 documents.
  - Document Catalog: new "Architecture Decision Records" section added with a table listing ADR-001 through ADR-005, their titles, status (Accepted), date (2026-03-31), and arc42 section mappings.
- **Evidence:** Five ADRs exist in `SourceDocuments/adr/` (001–005), all dated 2026-03-31.

---

## Workflow Loops Required

None. All 14 findings were resolved directly from available evidence.

**Coordination advisories (not blocking, but recommended):**

1. **ADR-005 should be updated** to remove the claim "MUI 6 targets React 18+. Choosing React 18+ is a prerequisite for using MUI 6." and replace it with the corrected rationale (React 18 chosen for concurrent rendering; MUI 6 supports React 17/18/19). The arc42 sections (§02, §04) are now correct; the ADR remains inconsistent. Run `/architecture:review-adr-consistency` after updating ADR-005.

2. **ADR-002 should be updated** to remove the stale Vite esbuild and Rollup claims (findings I-2 and I-3 from the ADR consistency review). The arc42 sections (§02, §07) are now correct; the ADR remains inconsistent.

---

## Source Gaps

None. All findings were resolvable from existing sources, ADRs, or clear inferences.

---

## Post-Remedy Verification

After applying all fixes, the following cross-section relationships were verified:

| Section A | Section B | Relationship | Status |
|-----------|-----------|-------------|--------|
| §02 | §04 | React 18 rationale consistency | Fixed — both now correctly describe MUI 6 compatibility and concurrent rendering rationale |
| §05 Level 1 | §05 Level 2 | YamlEditorDialog ownership | Fixed — Level 2 now shows `SectionForm --> YamlEditorDialog`; Level 1 has explanatory note |
| §05 Level 2 | §06 Scenario 2 | Component that opens YamlEditorDialog | Consistent — both reference NetworkSection/StorageActionSection |
| §02 | §07 | Vite build target and bundler claims | Fixed — both sections now use version-aware descriptions |
| §01 | §04 | Section count (24 vs 26) | Fixed — §01 now explicitly states 24+2=26 |
| §04 | §06 | React hook for YAML deferral | Fixed — both now reference `useDeferredValue` |
| §04 | §09 | React hook in ADR-005 table | Fixed — §09 ADR-005 table now uses `useDeferredValue` |
| §08 | §11 | Error boundary gap tracking | Fixed — TD-4 added to §11 |
| §00 | SourceDocuments/adr/ | ADR count | Fixed — §00 now shows 5 ADRs with full catalog |
| resolved-questions.md Q-1 | §05 | YamlEditorDialog section count | Fixed — source document now matches §05 (2 sections, not 3) |
