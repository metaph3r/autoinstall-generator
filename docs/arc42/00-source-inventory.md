# Source Document Inventory

**Generated:** 2026-03-31  
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
| 1 | `001-hybrid-ui-model.md` | Hybrid UI Model: Structured Forms with YAML Editor Escape Hatches | Accepted | 2026-03-31 | §01, §04, §05, §06, §08 |
| 2 | `002-build-tooling-and-deployment.md` | Build Tooling: Vite; Deployment: GitHub Pages with GitHub Actions CI/CD | Accepted | 2026-03-31 | §02, §07, §08 |
| 3 | `003-syntax-highlighting-prismjs.md` | Syntax Highlighting: PrismJS via react-syntax-highlighter | Accepted | 2026-03-31 | §04, §08, §09 |
| 4 | `004-form-navigation-grouped-mui-tabs.md` | Form Navigation: Grouped MUI Tabs | Accepted | 2026-03-31 | §04, §05, §09 |
| 5 | `005-technology-stack-rationale.md` | Technology Stack Rationale: React 18+, MUI 6, Context+Reducer, React Hook Form, Zod, yaml | Accepted | 2026-03-31 | §02, §04, §08, §09 |

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

| Arc42 Section | Source Documents | Coverage |
|--------------|-----------------|----------|
| §01 Introduction and Goals | `SPEC.md` | Adequate — goals stated; quality attributes informal; no stakeholder list |
| §02 Constraints | `SPEC.md` | Sparse — technical constraints explicit; organizational/process constraints absent |
| §03 Context and Scope | `SPEC.md` | Sparse — web app scope clear; no stakeholder list; no explicit system boundary diagram |
| §04 Solution Strategy | `SPEC.md` | Adequate — key decisions documented; several choices left open |
| §05 Building Block View | `SPEC.md` | Rich — pages, components, form sections all specified; TypeScript model provided |
| §06 Runtime View | `SPEC.md` | Adequate — main flows described; no sequence diagrams |
| §07 Deployment View | — | **None** — no build system, hosting, CI/CD, or environment info |
| §08 Crosscutting Concepts | `SPEC.md` | Adequate — state, validation, form handling covered; auth/persistence inferred |
| §09 Architecture Decisions | `SPEC.md` | Sparse — choices listed; no rationale; 3 choices unresolved |
| §10 Quality Requirements | `SPEC.md` | Sparse — coverage and responsiveness stated; no SLOs, a11y, or browser matrix |
| §11 Risks and Technical Debt | `SPEC.md` | **None** — no explicit risk assessment; risks inferred from open choices |
| §12 Glossary | — | **None** — no definitions; 8 domain terms identified as needing definition |

---

## Contradictions

### C-01: Syntax highlighting library undecided

- **Source A:** "PrismJS" — `SPEC.md`, §Technische Basis
- **Source B:** "Highlight.js" — `SPEC.md`, §Technische Basis (listed as alternative)
- **Severity:** Important
- **Recommended resolution:** Make an explicit decision; both are viable. PrismJS has broader language support; Highlight.js has simpler integration. Choose and remove the alternative.

### C-02: Form navigation pattern undecided

- **Source A:** "Tabs" — `SPEC.md`, §Formular‑Editor
- **Source B:** "Stepper" — `SPEC.md`, §Formular‑Editor (listed as alternative)
- **Severity:** Minor
- **Recommended resolution:** Tabs suit non-sequential exploration; Stepper suits a guided wizard flow. Choose based on intended UX and remove the alternative.

### C-03: Network configuration approach undecided

- **Source A:** "YAML‑Editor" — `SPEC.md`, §Network (listed first)
- **Source B:** "Formular" — `SPEC.md`, §Network (listed as alternative)
- **Severity:** Important — affects §04 solution strategy and §05 building block view
- **Recommended resolution:** Netplan configuration is complex and free-form; a YAML editor is more pragmatic. However, this breaks the "all fields via UI components" promise from §01.

### C-04: Storage Action mode vs. form-based goal

- **Source A:** "form-based creation" (all fields via UI components) — `SPEC.md`, §Ziel der Anwendung
- **Source B:** "YAML‑Editor empfohlen" for Storage Action mode — `SPEC.md`, §Storage
- **Severity:** Important — architectural inconsistency; Action mode scope must be clarified
- **Recommended resolution:** Either (a) scope out Action mode and only support Layout mode with structured form, or (b) explicitly acknowledge that some complex sections use an embedded YAML editor as a pragmatic escape hatch.

### C-05: Export page vs. embedded export buttons

- **Source A:** "Optional: Exportseite" — `SPEC.md`, §Seiten & Navigation
- **Source B:** Export buttons (Download, Copy) already in Form Editor — `SPEC.md`, §Formular‑Editor
- **Severity:** Minor
- **Recommended resolution:** Clarify whether the Export page is needed at all given buttons are already in the editor. Likely the Export page is unnecessary; remove or deprioritize it.

---

## Gaps

### §07 Deployment View — No source coverage

The specification contains no information about:
- Build tooling (Vite, Create React App, Next.js, etc.)
- Target hosting environment (static hosting, CDN, containerized)
- CI/CD pipeline
- Environment configuration (dev, staging, prod)
- Asset optimization and bundle strategy

**What is needed:** A separate ADR or deployment decision record covering build tooling and hosting strategy.

### §02 Organizational Constraints — No source coverage

No organizational, regulatory, or process constraints are stated. Missing:
- Browser support requirements
- Accessibility standards (WCAG level)
- License requirements for dependencies
- Localization/language requirements beyond "optional"

### §09 Decision Rationale — Sparse

All technology choices are listed without rationale. This makes future re-evaluation difficult. A set of ADRs should document why each key dependency was chosen over alternatives.

### §11 Risks — No source coverage

No risk assessment exists. The following risks are implied by the spec but not articulated:
- Scope creep from "optional" features (i18n, dark mode, import)
- Maintenance burden if Canonical updates the Autoinstall schema
- Complexity of Storage Action and Network sections requiring embedded YAML editors

### §12 Glossary — No source coverage

Eight domain terms are used without definition. A glossary is needed for contributors unfamiliar with Ubuntu provisioning tooling.

### §01 Stakeholders — No source coverage

No stakeholder list. Implied stakeholders: end users (Ubuntu sysadmins), contributors (open source), Canonical (normative schema owner).

### §10 Quality SLOs — Sparse

No performance targets, accessibility requirements, or browser support matrix. These should be defined before implementation to drive technical decisions.

---

## Supersession Chain

| Superseded Document | Superseded By | Date | Reason |
|--------------------|---------------|------|--------|
| *None detected* | — | — | — |
