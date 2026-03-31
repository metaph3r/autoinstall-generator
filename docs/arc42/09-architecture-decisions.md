# §09 Architecture Decisions

**Generated:** 2026-03-31
**Sources:** `SourceDocuments/adr/001–005`, `architecture/questions/resolved-questions.md`

---

This section provides a summary of all architecture decisions made for this project. Each decision
is documented in a full ADR in `SourceDocuments/adr/`. This section provides a navigation index
and a brief impact summary.

---

## Decision Summary Table

| ADR | Title | Status | Key Decision | Primary Arc42 Impact |
|-----|-------|--------|-------------|---------------------|
| [ADR-001](../../SourceDocuments/adr/001-hybrid-ui-model.md) | Hybrid UI Model | Proposed | Structured forms for 24 sections; YAML editor escape hatches (MUI Dialog) for Network and Storage Action mode; User-Data via structured form (cloud-init `users` module) | §01, §04, §05, §06, §08 |
| [ADR-002](../../SourceDocuments/adr/002-build-tooling-and-deployment.md) | Build Tooling and Deployment | Proposed | Vite build tool; GitHub Pages hosting; GitHub Actions CI/CD (lint → type-check → test → build → deploy) | §02, §07, §08 |
| [ADR-003](../../SourceDocuments/adr/003-syntax-highlighting-prismjs.md) | Syntax Highlighting | Proposed | `react-syntax-highlighter` with PrismJS backend; YAML grammar only; ~13 KB gzipped bundle contribution | §08, §09 |
| [ADR-004](../../SourceDocuments/adr/004-form-navigation-tabs.md) | Form Navigation | Proposed | MUI Tabs with 6 logical section groups; MUI Accordion within each group; no Stepper in v1 | §04, §05 |
| [ADR-005](../../SourceDocuments/adr/005-technology-stack-rationale.md) | Technology Stack Rationale | Proposed | React 18+, MUI 6, Context+Reducer, React Hook Form, Zod, `yaml` npm package — each with documented rationale | §02, §08, §09 |

---

## ADR-001: Hybrid UI Model

**Triggered by:** Q-1 (structural impossibility of form-based Network and Storage Action mode)

**Context:** The specification promises "all fields via UI components" but simultaneously
recommends or requires YAML editors for Network (Netplan) and Storage Action mode. The Netplan
schema is open-ended; Storage Action format is unschemaed in the official JSON Schema.

**Decision:** Adopt a hybrid model:
- **24 sections**: structured forms (MUI TextField, Select, Switch, Checkbox, Table, Accordion)
- **Network**: YAML editor escape hatch in MUI Dialog (Netplan YAML)
- **Storage Action mode**: YAML editor escape hatch in MUI Dialog
- **User-Data**: structured form scoped to cloud-init `users` module (replaces earlier `any` type with typed `UserDataConfig`)

The §01 goal statement is updated to: "Most Autoinstall fields are covered via structured UI
components; Network and Storage Action mode use embedded YAML editors as intentional escape
hatches for structurally unbounded sections."

**Consequences:** `YamlEditorDialog` component needed in §05; escape-hatch flow in §06; raw YAML
string merge handling in §08 state management.

---

## ADR-002: Build Tooling and Deployment

**Triggered by:** Q-2 (§07 could not be drafted without deployment decisions)

**Context:** The specification contains no build tooling or deployment information. The app is a
pure SPA with no backend.

**Decision:**
- Build tool: **Vite** (CRA is deprecated; Vite is the current React+TypeScript standard)
- Hosting: **GitHub Pages** (static, free for public repos, no external SaaS dependency)
- CI/CD: **GitHub Actions** with pipeline: `lint → type-check → test → vite build → deploy`
- Test runner: **Vitest** (natural pairing with Vite; Jest-compatible API)

**Consequences:** §07 can be fully drafted; Vitest enables `jest-axe` for a11y CI gates;
GitHub Pages constrains future server-side features.

---

## ADR-003: Syntax Highlighting — PrismJS

**Triggered by:** Q-3 (spec listed "PrismJS oder Highlight.js" without deciding)

**Context:** The YAML Preview requires syntax highlighting for exactly one language (YAML).
Bundle size target is < 500 KB gzipped.

**Decision:** `react-syntax-highlighter` with PrismJS backend. Import only the YAML grammar
(~8 KB) and one theme (~5 KB). Total gzipped bundle contribution: ~13 KB.

**Consequences:** React-idiomatic API; no DOM manipulation; backend can be switched to Highlight.js
without API changes if needed.

---

## ADR-004: Form Navigation — Grouped MUI Tabs

**Triggered by:** Q-4 (spec listed "Tabs oder Stepper" without deciding; 26 sections require grouping)

**Context:** 26 Autoinstall sections cannot fit in a flat navigation. Target audience is expert
sysadmins who need direct access to specific sections.

**Decision:** MUI Tabs with **6 logical groups**:

| Group | Sections |
|-------|---------|
| System | version, interactive-sections, refresh-installer, early-commands, late-commands, error-commands |
| Network | network (YAML editor escape hatch), proxy |
| Storage | storage (Layout mode form + Action mode YAML editor) |
| Identity & Auth | identity, active-directory, ubuntu-pro, ssh |
| Software | source, apt, codecs, drivers, oem, snaps, packages, kernel, kernel-crash-dumps |
| Configuration | timezone, updates, shutdown, reporting, user-data, debconf-selections, zdevs |

MUI Accordion within each tab group for individual section expand/collapse.
No Stepper in v1 — deferred to v2.

**Consequences:** Expert users navigate directly to needed sections; novice users are underserved
in v1.

---

## ADR-005: Technology Stack Rationale

**Triggered by:** Q-8 (§09 cannot be written without documented rationale)

**Context:** The specification lists six technology choices without rationale. Future upgrade and
replacement decisions need an explicit baseline.

**Decision:** All six choices are confirmed with documented rationale:

| Technology | Key Rationale |
|-----------|--------------|
| React 18+ | Largest form-heavy SPA ecosystem; MUI 6 requires it; `useTransition` for live preview debouncing |
| MUI 6 | 1:1 match of spec's component inventory; built-in WAI-ARIA satisfies WCAG 2.1 AA |
| Context + Reducer | Single root config object is the canonical reducer use case; no external dependency needed |
| React Hook Form | Uncontrolled components — no full-tree re-render on each keystroke across 26 sections |
| Zod | TypeScript-first: single source of truth for types and validation; native React Hook Form integration |
| `yaml` package | Full YAML 1.2 compliance — required for Netplan and cloud-init content in escape-hatch sections |

**Consequences:** §09 has substantive rationale; the stack is React-specific (migration to
another framework requires replacing MUI, React Hook Form, and the Zod integration).

---

## Decisions Not Formalized as ADRs

The following decisions were resolved in the question-resolution process without requiring a
formal ADR:

| Decision | Resolution | Source |
|---------|-----------|--------|
| Export page removed | Export actions are already in the Form Editor's YAML Preview panel; a separate page adds no functionality | Q-5, resolved |
| Evergreen browser support | Last 2 major versions of Chrome, Firefox, Safari, Edge; IE11 excluded | Q-6, resolved |
| WCAG 2.1 AA | Standard adopted by most digital accessibility regulations; MUI 6 provides the baseline | Q-7, resolved |
| Stakeholder classes | 5 classes: sysadmins, homelabbers, contributors, Canonical, maintainer | Q-9, resolved |
| Quality SLOs | YAML < 50 ms, LCP < 2 s, bundle < 500 KB, a11y: zero critical axe violations | Q-10, resolved |
| Risk register | 4 risks: schema drift, scope creep, YAML merge complexity, Clipboard API | Q-11, resolved |
| Glossary terms | 8 Ubuntu/Linux domain terms | Q-12, resolved |

---

## Cross-References

- Technology constraints: [§02 Constraints](02-constraints.md)
- UX and data strategy: [§04 Solution Strategy](04-solution-strategy.md)
- Component structure derived from ADR-001 and ADR-004: [§05 Building Block View](05-building-block-view.md)
- Crosscutting patterns from ADR-003 and ADR-005: [§08 Crosscutting Concepts](08-crosscutting-concepts.md)
