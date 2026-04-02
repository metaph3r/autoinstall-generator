# Source Document Inventory

**Generated:** 2026-03-31
**Finalized:** 2026-04-02
**Purpose:** Comprehensive inventory of all source documents with arc42 section mapping
and cross-reference analysis.

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Application specifications | 1 |
| ADRs | 5 |
| Research documents | 0 |
| Infrastructure documents | 0 |
| **Total** | **6 documents** |

---

## Document Catalog

### Application Specification (repo root)

| # | File | Status | Date | Key Topics | Arc42 Sections | Cross-References |
|---|------|--------|------|------------|----------------|------------------|
| 1 | `SPEC.md` | Draft (implied) | — | React/TS web app, form-based Ubuntu autoinstall.yaml generator, MUI 6, Zod, YAML preview | §01, §02, §03, §04, §05, §06, §08, §09, §10 | [Canonical Autoinstall reference](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html), [Autoinstall schema](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-schema.html), [Autoinstall validation](https://canonical-subiquity.readthedocs-hosted.com/en/latest/howto/autoinstall-validation.html) |

### Architecture Decision Records (`SourceDocuments/adr/`)

| # | File | Title | Status | Date | Arc42 Sections |
|---|------|-------|--------|------|----------------|
| 1 | `001-hybrid-ui-model.md` | Hybrid UI Model: Structured Forms with YAML Editor Escape Hatches | Proposed | 2026-03-31 | §01, §04, §05, §06, §08 |
| 2 | `002-build-tooling-and-deployment.md` | Build Tooling: Vite; Deployment: GitHub Pages with GitHub Actions CI/CD | Proposed | 2026-03-31 | §02, §07, §08 |
| 3 | `003-syntax-highlighting-prismjs.md` | Syntax Highlighting: PrismJS via react-syntax-highlighter | Proposed | 2026-03-31 | §04, §08, §09 |
| 4 | `004-form-navigation-tabs.md` | Form Navigation: Grouped MUI Tabs | Proposed | 2026-03-31 | §04, §05, §09 |
| 5 | `005-technology-stack-rationale.md` | Technology Stack Rationale: React 18+, MUI 6, Context+Reducer, React Hook Form, Zod, yaml | Proposed | 2026-03-31 | §02, §04, §08, §09 |

---

## Extracted Claims

### From `SPEC.md`

#### §01 Introduction and Goals

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Goal: form-based creation of a complete `autoinstall.yaml` for Ubuntu installations | Explicit | §Ziel der Anwendung |
| All fields of the official Autoinstall reference are covered via UI components | Explicit | §Ziel der Anwendung |
| YAML is generated live and can be exported or copied | Explicit | §Ziel der Anwendung |
| Target users are people configuring unattended Ubuntu installs (sysadmins, DevOps) | Inferred | §Ziel der Anwendung |
| External normative reference: Canonical Autoinstall reference, schema, and validation docs | Explicit | §Ziel der Anwendung (links) |

#### §02 Constraints

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Frontend framework: React 18+ | Explicit | §Technische Basis |
| Language: TypeScript | Explicit | §Technische Basis |
| UI library: MUI 6 | Explicit | §Technische Basis |
| State management: React Context + Reducer | Explicit | §Technische Basis |
| Form handling: React Hook Form | Explicit | §Technische Basis |
| Validation: Zod | Explicit | §Technische Basis |
| YAML serialization: `yaml` npm package | Explicit | §Technische Basis |
| Syntax highlighting: PrismJS **or** Highlight.js — choice not made | Explicit | §Technische Basis |
| No organizational, process, or regulatory constraints stated | — | (absent) |

#### §03 Context and Scope

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Delivered as a web application | Explicit | §Seiten & Navigation |
| Client-side only — no backend or server component mentioned | Inferred | entire SPEC.md |
| Browser is the sole runtime environment | Inferred | entire SPEC.md |
| External system boundary: Ubuntu Autoinstall JSON Schema from Canonical | Explicit | §Ziel der Anwendung, §JSON Schema |
| No authentication, user accounts, or server-side persistence | Inferred | entire SPEC.md |
| No stakeholder list provided | — | (absent) |

#### §04 Solution Strategy

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Primary UX metaphor: form-based input (not raw YAML editing) | Explicit | §Ziel der Anwendung |
| Multi-page form implemented as Tabs **or** Stepper — undecided | Explicit | §Formular‑Editor |
| Two-column layout: form left, YAML preview right (responsive) | Explicit | §Layout |
| YAML generated live from global application state | Explicit | §YAML‑Generierung |
| Pure SPA — no page navigations to a backend | Inferred | entire SPEC.md |
| Storage Action mode and Network section partially break form-only model (suggest embedded YAML editors) | Explicit (contradiction) | §Storage, §Network |

#### §05 Building Block View

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Page: Homepage with intro text and "Neues Projekt starten" button | Explicit | §Startseite |
| Page: Form Editor (multi-section form + YAML preview) | Explicit | §Formular‑Editor |
| Page: Optional Export page with download options and usage hints | Explicit | §Exportseite |
| Navigation: MUI AppBar with title; optional GitHub link, language toggle, dark mode toggle | Explicit | §Navigation |
| 26 form sections covering the full Autoinstall specification | Explicit | §Formularstruktur |
| UI components used: TextField, Select, Switch, Checkbox, Tabs/Stepper, Accordion, Table, Dialog | Explicit | §Komponenten |
| YAML Preview: live-updating, syntax-highlighted, with Copy and Download buttons | Explicit | §YAML‑Preview |
| TypeScript data model (`AutoinstallConfig` interface) covering all sections | Explicit | §Datenmodell |
| Embedded JSON Schema for validation reference | Explicit | §JSON Schema |

#### §06 Runtime View

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Every form input change triggers immediate YAML regeneration | Explicit | §YAML‑Preview |
| Download action exports file as `autoinstall.yaml` | Explicit | §Exportfunktionen |
| Copy action writes YAML to system clipboard | Explicit | §Exportfunktionen |
| YAML generation is fully client-side (state → serialization → display) | Inferred | §YAML‑Generierung |
| No network calls occur during YAML generation | Inferred | entire SPEC.md |

#### §07 Deployment View

*No claims available — section entirely absent from source.*

#### §08 Crosscutting Concepts

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Global state managed via React Context + Reducer | Explicit | §Technische Basis |
| Per-section validation via Zod schemas | Explicit | §Validierung |
| Validation errors displayed inline in the form | Explicit | §Validierung |
| Form state handled by React Hook Form | Explicit | §Technische Basis |
| Required fields: `version`, `identity.username`, `identity.hostname`, `identity.password` (unless user-data is provided) | Explicit | §Validierung |
| No persistence layer (no localStorage, no backend) | Inferred | entire SPEC.md |
| No authentication mechanism | Inferred | entire SPEC.md |

#### §09 Architecture Decisions

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| React 18+ chosen as framework (rationale not stated) | Explicit (choice), Inferred (rationale) | §Technische Basis |
| MUI 6 chosen as UI library (rationale not stated) | Explicit (choice), Inferred (rationale) | §Technische Basis |
| React Context + Reducer chosen over Redux/Zustand (rationale not stated) | Explicit (choice), Inferred (rationale) | §Technische Basis |
| Zod chosen for validation (rationale not stated) | Explicit (choice), Inferred (rationale) | §Technische Basis |
| `yaml` npm package chosen for serialization (rationale not stated) | Explicit (choice), Inferred (rationale) | §Technische Basis |
| PrismJS vs Highlight.js — **UNRESOLVED** | Explicit (open) | §Technische Basis |
| Tabs vs Stepper for form navigation — **UNRESOLVED** | Explicit (open) | §Formular‑Editor |
| YAML editor vs structured form for Network and Storage Action sections — **UNRESOLVED** | Explicit (open) | §Network, §Storage |

#### §10 Quality Requirements

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Complete coverage of all official Ubuntu Autoinstall fields | Explicit | §Ziel der Anwendung |
| Responsive design: two-column on desktop, stacked on mobile | Explicit | §Layout |
| Live YAML preview with syntax highlighting | Explicit | §YAML‑Preview |
| Required field validation with error display | Explicit | §Validierung |
| No performance targets stated | — | (absent) |
| No accessibility (a11y) requirements stated | — | (absent) |
| No browser support matrix stated | — | (absent) |

#### §11 Risks and Technical Debt

| Claim | Confidence | Source Location |
|-------|-----------|-----------------|
| Storage Action mode is complex; spec suggests YAML editor as workaround | Inferred | §Storage |
| Network config approach (form vs YAML editor) is undecided — implementation risk | Inferred | §Network |
| Syntax highlighting library choice is deferred | Explicit (open) | §Technische Basis |
| Extensibility features (i18n, YAML import, dark mode) are explicitly "optional/future" | Explicit | §Erweiterbarkeit |
| No formal risk assessment exists | — | (absent) |

#### §12 Glossary

*No explicit glossary in source. Terms used without definition:*

| Term | First Appearance |
|------|-----------------|
| autoinstall.yaml | §Ziel der Anwendung |
| Autoinstall | §Ziel der Anwendung |
| Netplan | §Network |
| LUKS | §Storage |
| cloud-init | §User-Data |
| snaps | §Snaps |
| zdevs | §Zdevs |
| Debconf | §Debconf Selections |

---

## Arc42 Coverage Map

*Updated 2026-04-02 after finalization. All sections now have rich or adequate coverage.*

| Arc42 Section | Source Documents | Coverage |
|--------------|-----------------|----------|
| §01 Introduction and Goals | `SPEC.md` | **Rich** — application purpose, v1 scope, out-of-scope, normative references, quality goals, stakeholders all documented |
| §02 Constraints | `SPEC.md`, ADR-002, ADR-005 | **Rich** — technical, browser, accessibility, organizational, and convention constraints documented; MUI 6 / React 18 relationship clarified |
| §03 Context and Scope | `SPEC.md` | **Rich** — business and technical context diagrams; 4 external interfaces; v1 scope boundary explicit |
| §04 Solution Strategy | `SPEC.md`, ADR-001 through ADR-005 | **Rich** — technology stack, UX strategy, data strategy, validation strategy, and quality strategy documented |
| §05 Building Block View | `SPEC.md`, ADR-001, ADR-004 | **Rich** — L1 and L2 decompositions with Mermaid diagrams; 24 section forms + 2 escape hatches; data model |
| §06 Runtime View | `SPEC.md`, ADR-001 | **Rich** — 5 runtime scenarios with sequence diagrams; clipboard fallback; validation gate |
| §07 Deployment View | ADR-002 | **Rich** — dev and production environments; CI/CD pipeline diagram; build artifacts; known technical debt |
| §08 Crosscutting Concepts | `SPEC.md`, ADR-003, ADR-005 | **Rich** — 9 crosscutting concepts documented: state, form handling, validation, serialization, syntax highlighting, accessibility, layout, dev experience, error handling |
| §09 Architecture Decisions | ADR-001 through ADR-005 | **Rich** — all 5 ADRs summarized; informal decisions from resolved questions also captured |
| §10 Quality Requirements | `SPEC.md`, resolved-questions.md | **Rich** — quality tree, 8 measurable SLOs, quality scenarios for latency, page load, accessibility, and YAML validity |
| §11 Risks and Technical Debt | resolved-questions.md | **Rich** — 4 risks (R-1 to R-4) with probability/impact and mitigation; 4 technical debt items (TD-1 to TD-4) with resolution paths |
| §12 Glossary | resolved-questions.md, `SPEC.md` | **Rich** — 15 terms defined: 8 domain terms + 7 technical acronyms (LCP, SPA, WAI-ARIA, WCAG, HMR, SLO, ESM) |

---

## Contradictions

*All contradictions resolved as of 2026-04-02.*

### C-01: Syntax highlighting library undecided — **RESOLVED**

- **Source A:** "PrismJS" — `SPEC.md`, §Technische Basis
- **Source B:** "Highlight.js" — `SPEC.md`, §Technische Basis (listed as alternative)
- **Resolution:** ADR-003 chose `react-syntax-highlighter` with PrismJS backend; YAML grammar only; ~13 KB gzipped.

### C-02: Form navigation pattern undecided — **RESOLVED**

- **Source A:** "Tabs" — `SPEC.md`, §Formular‑Editor
- **Source B:** "Stepper" — `SPEC.md`, §Formular‑Editor (listed as alternative)
- **Resolution:** ADR-004 chose MUI Tabs with 6 logical groups; non-sequential navigation for expert users; Stepper deferred to v2.

### C-03: Network configuration approach undecided — **RESOLVED**

- **Source A:** "YAML‑Editor" — `SPEC.md`, §Network (listed first)
- **Source B:** "Formular" — `SPEC.md`, §Network (listed as alternative)
- **Resolution:** ADR-001 chose YAML editor escape hatch for Network (unbounded Netplan schema) as a pragmatic decision; all other sections use structured forms.

### C-04: Storage Action mode vs. form-based goal — **RESOLVED**

- **Source A:** "form-based creation" (all fields via UI components) — `SPEC.md`, §Ziel der Anwendung
- **Source B:** "YAML‑Editor empfohlen" for Storage Action mode — `SPEC.md`, §Storage
- **Resolution:** ADR-001 updated the goal statement: "Most Autoinstall fields are covered via structured UI components; Network and Storage Action mode use embedded YAML editors as intentional escape hatches."

### C-05: Export page vs. embedded export buttons — **RESOLVED**

- **Source A:** "Optional: Exportseite" — `SPEC.md`, §Seiten & Navigation
- **Source B:** Export buttons (Download, Copy) already in Form Editor — `SPEC.md`, §Formular‑Editor
- **Resolution:** Q-5 decision removed the Export page; Download and Copy functionality is embedded in `YamlPreviewPanel`. Documented in §05 Building Block View and §09 Architecture Decisions.

---

## Gaps

*All original gaps addressed as of 2026-04-02.*

### §07 Deployment View — ~~No source coverage~~ RESOLVED

Addressed by ADR-002 (Build Tooling and Deployment), which documents Vite, GitHub Pages, GitHub Actions CI/CD pipeline, and the development/production environment split.

### §02 Organizational Constraints — ~~No source coverage~~ RESOLVED

Browser support (Q-6) and accessibility standard WCAG 2.1 AA (Q-7) now documented in §02. License remains a maintainer decision (noted as TODO in §02 — not blocking finalization).

### §09 Decision Rationale — ~~Sparse~~ RESOLVED

ADR-001 through ADR-005 provide full rationale for all key technology choices.

### §11 Risks — ~~No source coverage~~ RESOLVED

§11 now documents 4 risks (schema drift, scope creep, YAML merge complexity, Clipboard API) and 4 technical debt items with mitigation paths.

### §12 Glossary — ~~No source coverage~~ RESOLVED

§12 now defines 15 terms: 8 domain terms (Autoinstall, autoinstall.yaml, cloud-init, Debconf, LUKS, Netplan, Snaps, zdevs) + 7 technical acronyms.

### §01 Stakeholders — ~~No source coverage~~ RESOLVED

Q-9 identified and documented stakeholders: Ubuntu sysadmins/homelabbers, open-source contributors, Canonical, and the project maintainer.

### §10 Quality SLOs — ~~Sparse~~ RESOLVED

Q-10 defined 8 measurable SLOs: YAML schema validation, required field enforcement, < 50 ms YAML preview update, < 2 s LCP, < 500 KB bundle, < 100 ms form validation, zero critical axe-core violations, and last-2-versions evergreen browser support.

---

## Supersession Chain

| Superseded Document | Superseded By | Date | Reason |
|--------------------|---------------|------|--------|
| *None detected* | — | — | — |

---

## Traceability Matrix

| Arc42 Section | Source Documents | ADRs | Resolved Questions | Notes |
|--------------|-----------------|------|--------------------|-------|
| §01 Introduction and Goals | SPEC.md | — | Q-9 (stakeholders), Q-10 (quality goals), Q-12 (glossary terms) | LCP abbreviation expanded (IMP-3) |
| §02 Constraints | SPEC.md | ADR-002, ADR-005 | Q-6 (browser support), Q-7 (WCAG 2.1 AA) | MUI 6 / React 18 compatibility clarified (CR-1) |
| §03 Context and Scope | SPEC.md | — | — | Business and technical context diagrams added |
| §04 Solution Strategy | SPEC.md | ADR-001, ADR-002, ADR-003, ADR-004, ADR-005 | Q-1 (UI model), Q-2 (build), Q-3 (highlighting), Q-4 (tabs), Q-5 (export) | All 5 ADRs referenced |
| §05 Building Block View | SPEC.md | ADR-001, ADR-004 | Q-5 (export page removed) | YamlEditorDialog ownership fixed in diagrams (IMP-1) |
| §06 Runtime View | SPEC.md | ADR-001 | — | 5 scenarios with sequence diagrams |
| §07 Deployment View | — | ADR-002 | Q-2 (build tooling), Q-8 (hosting) | Vite technology claims updated (IMP-2) |
| §08 Crosscutting Concepts | SPEC.md | ADR-003, ADR-005 | — | Error boundary tracking added (ADV-8) |
| §09 Architecture Decisions | — | ADR-001, ADR-002, ADR-003, ADR-004, ADR-005 | Q-1 through Q-12 | Informal decisions captured; ADR count updated (ADV-9) |
| §10 Quality Requirements | SPEC.md | — | Q-10 (SLOs), Q-11 (risks) | 8 measurable SLOs; quality scenarios |
| §11 Risks and Technical Debt | — | — | Q-11 (risk register) | 4 risks + 4 technical debt items |
| §12 Glossary | — | — | Q-12 (glossary terms) | 15 terms: 8 domain + 7 acronyms; LCP added (IMP-3) |

## Architecture Workflow Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| Source Inventory | `docs/arc42/00-source-inventory.md` | Source-to-section mapping and finalization record |
| Open Questions | `architecture/questions/open-questions.md` | Architecture question log (all 12 resolved) |
| Resolved Questions | `architecture/questions/resolved-questions.md` | Decision log with rationale |
| ADR Consistency Review | `architecture/adr-consistency-review.md` | ADR quality report |
| Arc42 Consistency Review | `architecture/arc42-consistency-review.md` | Section quality report (14 findings, all addressed) |
| Arc42 Gap Remedies | `architecture/arc42-gap-remedies.md` | Applied fixes log |

---

## Finalization Note

**Finalized:** 2026-04-02

All 12 arc42 sections have been drafted, reviewed for consistency, and remediated. The documentation is ready for maintainer review. Two informational TODOs remain open pending maintainer decisions:

1. **§02 — License**: No OSI license has been specified in any source document. The maintainer should choose MIT, Apache-2.0, or GPL before the first public release.
2. **§07 — GitHub Pages URL**: The specific GitHub organization and repository name (and therefore the production URL) are not specified in any source document. The maintainer should confirm this before deployment.

These items do not block the architectural documentation but should be resolved before the project goes public.
