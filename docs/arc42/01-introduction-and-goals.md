# §01 Introduction and Goals

**Generated:** 2026-03-31
**Sources:** `SPEC.md` §Ziel der Anwendung, `architecture/questions/resolved-questions.md` (Q-1, Q-5, Q-9, Q-10), ADR-001, ADR-004

---

## 1.1 Requirements Overview

### Purpose

This application provides a **form-based web interface for generating `autoinstall.yaml`
configuration files** for Ubuntu unattended installations. (Source: `SPEC.md` §Ziel der Anwendung)

Users fill in structured forms covering the full [Canonical Autoinstall specification](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html).
The application generates a valid `autoinstall.yaml` file in real time, which can be downloaded
or copied to the clipboard. (Source: `SPEC.md` §Ziel der Anwendung)

### Scope (v1)

The following are **in scope** for v1:

- Structured form UI covering approximately 24 Autoinstall sections (all sections where the
  field structure is known and bounded). (ADR-001)
- YAML editor escape hatches (embedded in MUI Dialog) for the two structurally unbounded sections:
  **Network** (Netplan YAML) and **Storage Action mode**. (ADR-001)
- User-Data section scoped to the cloud-init `users` module (structured form; fields: `name`,
  `gecos`, `passwd`, `groups`, `shell`, `lock_passwd`). (ADR-001)
- Live YAML preview with syntax highlighting, Copy to clipboard, and Download buttons. (SPEC.md, §Formular-Editor)
- Export via Download (`autoinstall.yaml`) and Clipboard copy — directly from the Form Editor. (Q-5, resolved)

The following are **explicitly out of scope for v1**:

- Separate Export page — removed; export actions are in-place in the Form Editor. (Q-5, resolved)
- Internationalization (i18n) — deferred to v2. (SPEC.md, §Erweiterbarkeit)
- YAML import (loading an existing `autoinstall.yaml` for editing) — deferred to v2.
- QR code export — deferred to v2. (SPEC.md, §Exportfunktionen)
- Guided wizard (Stepper) mode for novice users — deferred to v2. (ADR-004)
- Dark mode — deferred to v2. (SPEC.md, §Erweiterbarkeit)

### Normative References

| Reference | Purpose |
|-----------|---------|
| [Canonical Autoinstall reference](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html) | Defines the full Autoinstall section schema |
| [Autoinstall JSON Schema](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-schema.html) | Machine-readable schema; embedded in application for validation |
| [Autoinstall validation guide](https://canonical-subiquity.readthedocs-hosted.com/en/latest/howto/autoinstall-validation.html) | Describes how to validate `autoinstall.yaml` files |

(Source: `SPEC.md` §Ziel der Anwendung)

---

## 1.2 Quality Goals

The top quality goals for this application, in priority order:

| Priority | Quality Attribute | Goal |
|----------|-------------------|------|
| 1 | **Correctness** | Generated `autoinstall.yaml` must be valid against the Canonical Autoinstall JSON Schema. Required fields (`version`, `identity.username`, `identity.hostname`, `identity.password`) must be validated before export. |
| 2 | **Performance** | Live YAML preview updates within 50 ms of any form input change. Initial page load LCP < 2 s on 4G. Bundle size < 500 KB gzipped. |
| 3 | **Usability** | Expert users (sysadmins) can navigate directly to any of the 26 form sections via grouped Tab navigation (6 groups) without traversing irrelevant sections. |
| 4 | **Accessibility** | WCAG 2.1 Level AA compliance. Automated axe-core gate in CI. MUI 6 WAI-ARIA as the baseline. |
| 5 | **Maintainability** | The application's TypeScript data model and Zod schemas must be updatable when Canonical publishes Autoinstall schema changes; no hardcoded schema version coupling beyond the `version: 1` field. |

See [§10 Quality Requirements](10-quality-requirements.md) for quantitative SLOs and quality
scenarios.

---

## 1.3 Stakeholders

| Stakeholder | Role | Key Interest |
|-------------|------|-------------|
| Ubuntu sysadmins / DevOps engineers | Primary end users | Generate correct, valid `autoinstall.yaml` files efficiently without memorizing the Autoinstall reference |
| Homelabbers / self-hosters | Secondary end users | Automate Ubuntu installations in non-enterprise contexts |
| Open source contributors | Developers | Add support for new Autoinstall sections as Canonical extends the schema; maintain the React/TypeScript codebase |
| Canonical | Normative authority | Owns and evolves the Autoinstall schema and reference; schema changes can break this application if not managed |
| Project maintainer | Product owner / architect | Prioritizes features, accepts contributions, makes architectural decisions |

(Source: Q-9, resolved; inferred from `SPEC.md` §Ziel der Anwendung and §Navigation)

> ⚠️ Inferred: The stakeholder list is derived from the application's described purpose and the
> GitHub link in the navigation bar (implying an open-source project). No stakeholder analysis
> document exists in the source inventory.

---

## Cross-References

- Technical constraints bounding the solution: [§02 Constraints](02-constraints.md)
- System boundary and external interfaces: [§03 Context and Scope](03-context-and-scope.md)
- Architecture decisions: [§09 Architecture Decisions](09-architecture-decisions.md)
- Quantitative quality targets: [§10 Quality Requirements](10-quality-requirements.md)
- Glossary of domain terms: [§12 Glossary](12-glossary.md)
