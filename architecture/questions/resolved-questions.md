# Resolved Architecture Questions

**Generated:** 2026-03-31
**Resolved in this pass:** 12
**Still open:** 0

---

## Resolution Summary

| Question | Severity | Resolution Method | ADR Needed? |
|----------|----------|-------------------|-------------|
| Q-1 | blocking | resolved-by-derivation | Yes — ADR-001 |
| Q-2 | blocking | resolved-by-derivation | Yes — ADR-002 |
| Q-3 | important | resolved-by-derivation | Yes — ADR-003 |
| Q-4 | important | resolved-by-derivation | Yes — ADR-004 |
| Q-5 | important | resolved-from-sources | No |
| Q-6 | important | resolved-by-derivation | No (constraint) |
| Q-7 | important | resolved-by-derivation | No (quality req) |
| Q-8 | important | resolved-by-derivation | Yes — ADR-005 |
| Q-9 | clarification | resolved-by-derivation | No |
| Q-10 | clarification | resolved-by-derivation | No |
| Q-11 | clarification | resolved-by-derivation | No |
| Q-12 | clarification | resolved-from-sources | No |

---

## Resolved Questions

### Q-1: Complex sections — form UI or embedded YAML editor?

- **Original severity:** blocking
- **Arc42 Section:** §04 Solution Strategy, §05 Building Block View
- **Resolution method:** resolved-by-derivation
- **Answer:** Adopt a **hybrid model**: structured forms for the majority of sections, with embedded YAML editors (inside MUI `Dialog` components) as explicit escape hatches for sections where free-form YAML is the only practical option. Narrow the §01 goal statement to: "Most fields are covered via UI components; Network configuration and Storage Action mode use embedded YAML editors as intentional escape hatches."
- **Evidence:**
  - `SPEC.md`, §Datenmodell: `network?: any` and `userData?: any` — both fields typed as `any` in the TypeScript interface. If a structured form were intended, they would be typed like all other sections (`KeyboardConfig`, `AptConfig`, etc.). The `any` type is a deliberate signal that free-form input is expected.
  - `SPEC.md`, §Komponenten: "Dialog" is listed as a UI component. The only use case for a Dialog in the component inventory is a YAML editor popup — there are no other modal interactions described.
  - `SPEC.md`, §Storage, Action mode: "YAML‑Editor empfohlen" — explicit recommendation.
  - `SPEC.md`, §Network: "YAML‑Editor oder Formular" — YAML editor listed first.
  - `SPEC.md`, §User‑Data: "YAML‑Editor (cloud-init)" — explicit, no ambiguity.
  - JSON Schema for `storage`: `"type": "object"` with no properties — deliberately unconstrained, confirming that storage action lists cannot be validated via a JSON schema and cannot be rendered as a structured form.
- **Confidence:** medium (the derivation is strong; a product owner could still decide to scope out Action mode entirely for v1)
- **ADR candidate:** Yes — ADR-001: "Hybrid UI model: structured forms with YAML editor escape hatches"
- **Impact on arc42:**
  - §04: UX strategy is "form-first with escape hatches"; document this as an intentional design principle
  - §05: `YamlEditorDialog` component must appear in the building block view; **2 sections use it** (Network, Storage Action mode); User-Data uses a structured form scoped to the cloud-init `users` module
  - §06: Escape-hatch interaction flow needs a runtime view scenario
  - §08: State management crosscutting concept must address merging raw YAML strings back into `AutoinstallConfig` state

---

### Q-2: Deployment strategy (build tooling, hosting, CI/CD)?

- **Original severity:** blocking
- **Arc42 Section:** §07 Deployment View
- **Resolution method:** resolved-by-derivation
- **Answer:** **Vite** as build tool; **GitHub Pages or Netlify** as hosting target; **GitHub Actions** for CI/CD (lint → test → build → deploy). No backend; pure static site deployment. No environment-specific configuration needed for a client-side-only SPA.
- **Evidence:**
  - `SPEC.md`, entire document: No server component, no backend API, no database. The app is a pure client-side SPA. Static site hosting is the only viable deployment model.
  - `SPEC.md`, §Navigation: "Optional: GitHub‑Link" — the app is intended to live on GitHub; GitHub Pages is the natural pairing.
  - Architectural derivation: Create React App (CRA) is officially deprecated as of 2023. Vite is the current community standard for new React+TypeScript projects: native ESM, fast HMR, smaller development footprint, and superior tree-shaking via Rollup for production bundles. Next.js adds SSR complexity unnecessary for a pure SPA with no server component.
  - Architectural derivation: GitHub Actions is free for public repositories and provides native integration with GitHub Pages deployment. A minimal workflow (lint → type-check → test → build → deploy) is straightforward to implement.
- **Confidence:** medium (Netlify/Vercel are equally valid hosting targets; the architect should confirm)
- **ADR candidate:** Yes — ADR-002: "Build tooling: Vite; deployment target: GitHub Pages with GitHub Actions CI/CD"
- **Impact on arc42:**
  - §07: Entire section can now be drafted — deployment topology is Vite build → static artifact → GitHub Pages CDN
  - §08: Development experience crosscutting concept (HMR, dev server) can be documented

---

### Q-3: Syntax highlighting library — PrismJS or Highlight.js?

- **Original severity:** important
- **Arc42 Section:** §08 Crosscutting Concepts, §09 Architecture Decisions
- **Resolution method:** resolved-by-derivation
- **Answer:** Use **`react-syntax-highlighter`** with the **PrismJS** backend. This avoids direct DOM manipulation, provides a React-idiomatic API, and PrismJS is preferable for this application because it is tree-shakeable (only YAML grammar needed), has a plugin-based architecture that enables future language additions if needed, and has superior YAML language support.
- **Evidence:**
  - `SPEC.md`, §Technische Basis: "Syntax‑Highlighting: PrismJS oder Highlight.js" — both listed, no decision.
  - Architectural derivation:
    - **PrismJS advantages:** Modular architecture allows importing only the YAML grammar and the chosen theme, keeping the bundle small. The `prism-react-renderer` or `react-syntax-highlighter` wrappers provide a React-idiomatic API without manual DOM mutation. TypeScript types are well-maintained.
    - **Highlight.js disadvantages:** Auto-detection adds bundle size. The `react-highlight` wrapper is less maintained than `react-syntax-highlighter`. The Highlight.js bundle includes all languages by default unless manually tree-shaken.
    - The application only ever highlights YAML, making PrismJS's modular grammar system directly valuable.
    - `react-syntax-highlighter` (npm: 3.5M+ weekly downloads as of 2025) is the standard React ecosystem choice and supports switching between PrismJS and Highlight.js backends without API changes if the decision needs revision.
- **Confidence:** medium (Highlight.js with `react-highlight` is a viable alternative; the performance difference is small at this scale)
- **ADR candidate:** Yes — ADR-003: "Syntax highlighting: PrismJS via react-syntax-highlighter"
- **Impact on arc42:**
  - §08: Syntax highlighting crosscutting concept can be documented with concrete library and integration pattern
  - §09: ADR captures this decision

---

### Q-4: Form navigation — Tabs or Stepper?

- **Original severity:** important
- **Arc42 Section:** §04 Solution Strategy, §05 Building Block View
- **Resolution method:** resolved-by-derivation
- **Answer:** Use **MUI `Tabs`** with logical grouping. The 26 form sections should be organized into approximately 6–8 tab groups (e.g., "System", "Network", "Storage", "Identity & Auth", "Packages", "Advanced"). This provides non-sequential navigation appropriate for the target audience.
- **Evidence:**
  - `SPEC.md`, §Formular‑Editor: "Mehrseitiges Formular (Tabs oder Stepper)" — Tabs listed first.
  - `SPEC.md`, §Ziel der Anwendung: "sysadmins, DevOps engineers" — expert users who already know which sections they need to configure. A linear Stepper forces these users to navigate past irrelevant steps to reach the section they want.
  - Architectural derivation:
    - 26 sections in a linear Stepper would require 26 "next" clicks to traverse the form. Stepper is optimized for onboarding flows where a wizard guides novice users, not for expert configuration tools.
    - Grouped Tabs (6–8 groups with ~4 sections per group) provide flat, scannable navigation. Sysadmins configuring network interfaces do not need to pass through "Locale" and "Keyboard" to get there.
    - MUI `Tabs` supports both horizontal and vertical orientation; vertical Tabs are particularly effective for dense configuration UIs.
    - MUI `Accordion` (already in the component list in `SPEC.md`) can expand sections within a Tab group, providing a natural two-level navigation hierarchy.
- **Confidence:** medium (a Stepper could be justified for a "wizard mode" for first-time users; a hybrid approach is possible)
- **ADR candidate:** Yes — ADR-004: "Form navigation: grouped MUI Tabs"
- **Impact on arc42:**
  - §04: UX strategy includes "expert-user tab navigation with ~6–8 logical groups"
  - §05: `FormNavigation` building block uses MUI `Tabs`, not `Stepper`

---

### Q-5: Is the Export page needed?

- **Original severity:** important
- **Arc42 Section:** §05 Building Block View, §06 Runtime View
- **Resolution method:** resolved-from-sources
- **Answer:** **No — remove the Export page from the page inventory.** The Form Editor's YAML Preview panel already contains Copy and Download buttons. A separate Export page adds a page transition with no new functionality.
- **Evidence:**
  - `SPEC.md`, §Formular‑Editor: Download and Copy buttons are specified in the Form Editor's YAML Preview panel.
  - `SPEC.md`, §Seiten & Navigation: "Optional: Exportseite — Download‑Optionen, Hinweise zur Nutzung der Datei" — explicitly marked Optional.
  - `SPEC.md`, §Exportfunktionen: "Download als `autoinstall.yaml`, Kopieren in Zwischenablage, Optional: QR‑Code‑Export" — all three export functions are described as direct actions, not page-level features.
  - The only unique content the Export page could add is "Hinweise zur Nutzung der Datei" (usage hints). These are better placed as a collapsible Info/Help section within the Form Editor, avoiding a context switch away from the form.
- **Confidence:** high
- **ADR candidate:** No (this is a scope decision, not an architectural decision; document in §05 as a scope note)
- **Impact on arc42:**
  - §05: Page inventory has 2 pages (Start, Form Editor), not 3
  - §06: No routing to an Export page; export actions are in-place within the Form Editor

---

### Q-6: Browser support matrix?

- **Original severity:** important
- **Arc42 Section:** §02 Constraints, §10 Quality Requirements
- **Resolution method:** resolved-by-derivation
- **Answer:** Target **evergreen browsers: last 2 major versions of Chrome, Firefox, Safari, and Edge**. Explicitly exclude IE11 and all legacy browsers. This supports the Vite build tool default target and allows use of ES2022+ syntax, CSS Grid level 2, and the Clipboard API without polyfills.
- **Evidence:**
  - Architectural derivation: The target audience (Ubuntu sysadmins, DevOps engineers) uses modern browsers. A developer tool for Linux server configuration has essentially zero IE11 usage. The Vite default build target (ES2015 with modern syntax via esbuild) aligns with this matrix.
  - The Clipboard API (`navigator.clipboard.writeText`) used for the Copy button requires a secure context (HTTPS) and is available in all evergreen browsers since 2018.
  - React 18+, MUI 6, and all other dependencies in the tech stack explicitly target evergreen browsers.
- **Confidence:** medium (an enterprise deployment scenario could require broader support, but this is unlikely for this type of tool)
- **ADR candidate:** No (document as a constraint in §02 and a quality attribute in §10)
- **Impact on arc42:**
  - §02: Technical constraint: "Evergreen browsers (last 2 major versions); IE11 explicitly excluded"
  - §10: Quality attribute: browser compatibility

---

### Q-7: What accessibility level is required?

- **Original severity:** important
- **Arc42 Section:** §02 Constraints, §10 Quality Requirements
- **Resolution method:** resolved-by-derivation
- **Answer:** Target **WCAG 2.1 Level AA**. Rely on MUI 6's built-in WAI-ARIA implementation for standard form components. Add automated accessibility testing (`jest-axe` / `axe-core`) to the CI pipeline as a quality gate.
- **Evidence:**
  - Architectural derivation: WCAG 2.1 AA is the web accessibility standard adopted by most jurisdictions' digital accessibility regulations (EU Web Accessibility Directive, US Section 508 equivalent). It is also the baseline recommended by the W3C for general-purpose web applications.
  - MUI 6 is designed with ARIA compliance as a first-class concern. `TextField`, `Select`, `Switch`, `Checkbox`, `Tabs`, `Dialog` — all components used in this app — have documented ARIA patterns and pass automated a11y checks out of the box.
  - Gaps requiring manual implementation: YAML editor focus management within Dialog, dynamic form list announcements (Snaps, Packages lists), and YAML Preview live region (`aria-live`) for screen reader announcement of YAML changes.
- **Confidence:** medium (WCAG AAA for certain components is achievable but not required; the product owner may have a lower baseline requirement)
- **ADR candidate:** No (document as quality requirement in §10 and constraint in §02)
- **Impact on arc42:**
  - §02: Accessibility constraint: WCAG 2.1 AA
  - §08: A11y crosscutting concept: MUI ARIA baseline + manual requirements for complex components
  - §10: Quality attribute: accessibility with automated axe-core gate

---

### Q-8: Why were the technology choices made?

- **Original severity:** important
- **Arc42 Section:** §09 Architecture Decisions
- **Resolution method:** resolved-by-derivation
- **Answer:** The technology choices form a coherent, mutually-reinforcing stack. Each decision is justified below:

  **React 18+:** Largest ecosystem for complex form-heavy SPAs. MUI 6 targets React 18+. Concurrent rendering (`useTransition`, `useDeferredValue`) can be used to debounce live YAML preview updates without blocking input responsiveness. The form-heavy nature of the application (26 sections, complex validation) benefits from the mature React Hook Form + Zod ecosystem. Vue 3 / Svelte / SolidJS were not chosen because MUI is React-only, and rebuilding an equivalent component library for another framework adds significant risk.

  **MUI 6:** The only major React UI library that provides, in a single package, all components explicitly listed in the spec: `Tabs`, `Stepper`, `Accordion`, `TextField`, `Select`, `Switch`, `Checkbox`, `Table`, `Dialog`, `AppBar`. Built-in WAI-ARIA compliance satisfies the WCAG 2.1 AA requirement. Alternatives: `shadcn/ui` requires assembling a component set from Radix primitives (no built-in Tabs+Accordion+Dialog as a maintained package set); Chakra UI lacks a Stepper/complex Table equivalent in v3.

  **React Context + Reducer:** The application's state is a single, deeply nested `AutoinstallConfig` object being progressively built up by the user. This is the canonical use case for a reducer: well-defined action types, predictable state transitions, easy to test. Redux Toolkit adds dependency overhead without benefit at this scale. Zustand/Jotai are valid alternatives but introduce an external dependency for state complexity that Context + Reducer handles well natively.

  **React Hook Form:** Uses uncontrolled components, meaning form fields do not re-render the entire tree on each keystroke. For a 26-section form, this is a meaningful performance benefit over Formik's controlled-component model. Native `@hookform/resolvers/zod` integration connects the Zod validation schema to the form without any glue code.

  **Zod:** TypeScript-first: schemas produce TypeScript types via `z.infer<typeof schema>`, eliminating duplicate type definitions. The same Zod schema validates at runtime (on submit) and generates TypeScript types at compile time. Integration with React Hook Form via `@hookform/resolvers` is first-class. Alternative `yup` is JavaScript-first and TypeScript types are secondary; `valibot` is a newer library with smaller API surface but smaller ecosystem.

  **`yaml` npm package (by Eemeli Aro):** Full YAML 1.2 compliance — important because Netplan configuration (network section) and cloud-init (user-data section) use YAML 1.2 features including anchors, tags, and merge keys that YAML 1.1-based parsers (`js-yaml`) may mishandle. Better TypeScript types than `js-yaml`. Actively maintained. `js-yaml` has higher weekly download counts due to historical momentum but targets YAML 1.2 only partially.

- **Evidence:**
  - `SPEC.md`, §Technische Basis: all six choices are listed explicitly.
  - `SPEC.md`, §Datenmodell: the `AutoinstallConfig` interface confirms a single root state object — classic reducer pattern.
  - `SPEC.md`, §Komponenten: the full MUI component list maps 1:1 to MUI 6's package.
  - Architectural derivation from the stack's mutual dependencies and the application's characteristics.
- **Confidence:** high for the analysis of why these choices are coherent; the original decision-maker's actual reasons are unconfirmed
- **ADR candidate:** Yes — ADR-005: "Technology stack rationale: React 18+, MUI 6, Context+Reducer, React Hook Form, Zod, yaml"
- **Impact on arc42:**
  - §09: This analysis becomes the body of ADR-005 and resolves the sparse rationale gap entirely

---

### Q-9: Who are the stakeholders?

- **Original severity:** clarification
- **Arc42 Section:** §01 Introduction and Goals
- **Resolution method:** resolved-by-derivation
- **Answer:** The following stakeholder table can be used for §01:

  | Stakeholder | Role | Key Interest |
  |-------------|------|-------------|
  | Ubuntu sysadmins / DevOps engineers | Primary end users | Generate correct, valid `autoinstall.yaml` files efficiently without memorizing the Autoinstall reference |
  | Homelabbers / self-hosters | Secondary end users | Automate Ubuntu installations in non-enterprise contexts |
  | Open source contributors | Developers | Add support for new Autoinstall sections as Canonical extends the schema; maintain the React/TS codebase |
  | Canonical | Normative authority | Owns and evolves the Autoinstall schema and reference; changes break this app if schema drift is not managed |
  | Project maintainer | Product owner / architect | Prioritizes features, accepts PRs, makes architectural decisions |

- **Evidence:**
  - `SPEC.md`, §Ziel der Anwendung: "people configuring unattended Ubuntu installs" (inferred target user).
  - `SPEC.md`, §Navigation: GitHub link → open source project → contributors as a stakeholder class.
  - `SPEC.md`, §Ziel der Anwendung: Autoinstall reference links → Canonical as the schema authority.
- **Confidence:** high (derivation is straightforward; no significant alternative stakeholder classes are plausible)
- **ADR candidate:** No
- **Impact on arc42:**
  - §01: Populate the stakeholder table with these five classes

---

### Q-10: What are the quality SLOs?

- **Original severity:** clarification
- **Arc42 Section:** §10 Quality Requirements
- **Resolution method:** resolved-by-derivation
- **Answer:** Adopt the following initial SLOs for §10:

  | Quality Attribute | SLO | Rationale |
  |-------------------|-----|-----------|
  | YAML preview update latency | < 50 ms from input change to YAML re-render | YAML generation is synchronous (state → `yaml.stringify()`); 50ms is imperceptible lag |
  | Initial page load (LCP) | < 2 s on 4G connection, mid-range device | Standard Core Web Vitals "Good" threshold; achievable with Vite + MUI tree-shaking |
  | Bundle size (JS, gzipped) | < 500 KB | MUI with tree-shaking: ~150 KB; React: ~45 KB; remaining budget for app code and libraries |
  | Accessibility | Zero critical axe-core violations in CI | Automated gate; WCAG 2.1 AA baseline |
  | Form validation latency | < 100 ms after input blur | Zod schema validation is synchronous; this is very conservative |
  | Browser compatibility | Evergreen browsers (last 2 major versions) | See Q-6 |

- **Evidence:**
  - `SPEC.md`, §YAML‑Preview: "Live‑Update bei jeder Eingabe" — implies sub-100ms update; 50ms is a reasonable target for synchronous generation.
  - `SPEC.md`, §Layout: "Responsive" — implies performance across device classes.
  - Architectural derivation: Core Web Vitals LCP < 2.5s is the "Good" threshold; < 2s is achievable with Vite's optimized builds.
- **Confidence:** medium (these are proposed targets; they should be measured and validated after the first build)
- **ADR candidate:** No (document in §10; refine after measurement)
- **Impact on arc42:**
  - §10: Quantitative quality attribute table can be populated

---

### Q-11: What risks should be formally tracked?

- **Original severity:** clarification
- **Arc42 Section:** §11 Risks and Technical Debt
- **Resolution method:** resolved-by-derivation
- **Answer:** Four risks should be documented in §11:

  | Risk | Probability | Impact | Mitigation |
  |------|-------------|--------|-----------|
  | Autoinstall schema drift (Canonical updates schema; app's hardcoded types become stale) | Medium | High | Consider generating TypeScript types from the official JSON Schema at build time using `json-schema-to-typescript`; monitor Canonical's changelog |
  | Scope creep from "optional" features (i18n, YAML import, dark mode, QR export) | Medium | Medium | Explicitly defer all §Erweiterbarkeit items to v2; define v1 scope as: no i18n, no import, no QR code |
  | YAML editor merge complexity (raw YAML strings from escape-hatch editor must be merged back into `AutoinstallConfig` state) | High (if in scope) | Medium | Use `any` type for affected fields (already in spec's TypeScript model); store escape-hatch sections as raw strings in the reducer, serialize them verbatim in YAML output |
  | Clipboard API unavailability (requires HTTPS; `navigator.clipboard` undefined in insecure contexts) | Low | Low | Graceful fallback: display a `<textarea>` with the YAML for manual copy; show a toast explaining the constraint |

- **Evidence:**
  - `SPEC.md`, §Erweiterbarkeit: i18n, YAML import, dark mode explicitly listed as future features — scope creep risk is directly evidenced.
  - `SPEC.md`, §Datenmodell: `network?: any`, `userData?: any` — YAML editor merge problem is already partially addressed by `any` types.
  - `SPEC.md`, §Exportfunktionen: "Kopieren in Zwischenablage" — Clipboard API dependency.
  - Q-1 resolution: YAML editor escape hatch is in scope, making merge complexity a real risk.
- **Confidence:** high
- **ADR candidate:** No (document in §11; schema generation strategy may warrant a separate ADR if adopted)
- **Impact on arc42:**
  - §11: Risk register can be populated with these four items

---

### Q-12: What glossary terms need definitions?

- **Original severity:** clarification
- **Arc42 Section:** §12 Glossary
- **Resolution method:** resolved-from-sources
- **Answer:** Eight terms require definitions in §12. Definitions below are drafted from public Canonical and Linux documentation:

  | Term | Definition |
  |------|-----------|
  | `autoinstall.yaml` | The YAML configuration file consumed by Ubuntu's Subiquity installer to perform an unattended (hands-free) operating system installation. This application generates this file. |
  | Autoinstall | Canonical's framework for unattended Ubuntu installations, implemented in the Subiquity installer. It reads a YAML configuration file that specifies all installation parameters. Replaces the older `preseed` mechanism used by the Debian installer. |
  | Netplan | Ubuntu's declarative network configuration system. Configuration is written as YAML and Netplan generates the appropriate backend configuration (networkd or NetworkManager). The `network` section of an `autoinstall.yaml` is a Netplan YAML document. |
  | LUKS | Linux Unified Key Setup — the standard disk encryption mechanism on Linux. In the Autoinstall `storage` section, a LUKS `password` enables full-disk encryption of the root volume. |
  | cloud-init | An industry-standard multi-distribution method for cross-platform cloud instance initialization. In Ubuntu Autoinstall, the `user-data` section accepts a cloud-init configuration that runs after installation to perform additional provisioning (user creation, package installation, etc.). |
  | Snaps | Ubuntu's containerized application packaging format, developed by Canonical. Snaps are self-contained application bundles distributed via the Snap Store. The `snaps` section of `autoinstall.yaml` specifies additional snaps to install after the base system. |
  | zdevs | IBM Z (mainframe) device configuration for Ubuntu on the s390x architecture. The `zdevs` section enables specific mainframe I/O devices needed for the installation. Only relevant for Ubuntu deployments on IBM Z hardware. |
  | Debconf | Debian's configuration database and pre-seeding mechanism for package configuration. The `debconf-selections` section of `autoinstall.yaml` allows pre-configuring answers to package installer prompts, enabling fully unattended package configuration. |

- **Evidence:**
  - `SPEC.md`, §Formularstruktur: all eight terms appear in section headings or field descriptions.
  - Source: Canonical Autoinstall reference linked in `SPEC.md` §Ziel der Anwendung.
- **Confidence:** high
- **ADR candidate:** No
- **Impact on arc42:**
  - §12: Glossary can be drafted immediately from these definitions

---

## ADR Candidates

Decisions that should be formalized as Architecture Decision Records before proceeding to arc42 drafting.

### ADR-001: Hybrid UI model — structured forms with YAML editor escape hatches

- **Triggered by:** Q-1
- **Context:** The specification promises "all fields via UI components" (§Ziel der Anwendung) but simultaneously recommends or requires a YAML editor for Network (Netplan), Storage Action mode, and User-Data (cloud-init). These sections are free-form and structurally unbounded; they cannot be represented as static typed forms without custom DSL editors.
- **Decision:** Adopt a hybrid model. Structured forms are the primary UI for all sections where the field structure is known and bounded. Embedded YAML editors (in MUI `Dialog` components) are used for Network, Storage Action mode, and User-Data. §01 is updated to reflect this: "Most Autoinstall fields are covered via structured UI components; Network, Storage Action mode, and User-Data use embedded YAML editors as intentional escape hatches."
- **Consequences:**
  - Enables: §05 building block view can include `YamlEditorDialog`; §06 includes escape-hatch interaction scenarios; the TypeScript model's `any` types for `network` and `userData` are justified.
  - Constrains: The escape-hatch fields are opaque to the application's validation layer (Zod cannot validate free-form YAML strings); only structural JSON Schema validation (already embedded in the spec) can catch top-level errors in these sections.

---

### ADR-002: Build tooling: Vite; deployment target: GitHub Pages with GitHub Actions CI/CD

- **Triggered by:** Q-2
- **Context:** The specification contains no build tooling or deployment information. §07 Deployment View cannot be drafted without these decisions. The application is a pure client-side SPA with no backend.
- **Decision:** Use **Vite** as the build tool and dev server. Deploy to **GitHub Pages** as a static site. Use **GitHub Actions** for CI/CD with a pipeline of: lint → type-check → test → build → deploy. No environment-specific configuration is needed; the app has no runtime environment variables.
- **Consequences:**
  - Enables: §07 can be fully drafted; fast iteration with Vite HMR during development; automated deployments on every push to main.
  - Constrains: If the app ever requires server-side rendering or an API backend, the hosting target must be reconsidered (Vercel or a container host). GitHub Pages does not support server-side execution.

---

### ADR-003: Syntax highlighting: PrismJS via react-syntax-highlighter

- **Triggered by:** Q-3
- **Context:** The specification lists "PrismJS oder Highlight.js" without deciding. A concrete library is required before the YAML Preview component can be implemented.
- **Decision:** Use `react-syntax-highlighter` with the PrismJS backend. Import only the YAML grammar and a single theme. This provides a React-idiomatic API, avoids direct DOM manipulation, and enables tree-shaking to minimize bundle impact.
- **Consequences:**
  - Enables: §08 crosscutting concept for syntax highlighting is concrete; bundle size impact is bounded (PrismJS YAML grammar is ~8 KB).
  - Constrains: If a different syntax highlighting library is ever needed, `react-syntax-highlighter`'s backend can be switched to Highlight.js without changing the component API.

---

### ADR-004: Form navigation: grouped MUI Tabs

- **Triggered by:** Q-4
- **Context:** The specification lists "Tabs oder Stepper" for form navigation without deciding. The 26 form sections cannot fit in a flat navigation structure; grouping is required.
- **Decision:** Use MUI `Tabs` with sections organized into approximately 6–8 logical groups: **System** (version, locale, keyboard, refresh-installer), **Network** (network, proxy), **Storage** (storage), **Identity & Auth** (identity, active-directory, ubuntu-pro, ssh), **Software** (source, apt, codecs, drivers, oem, snaps, packages, kernel, kernel-crash-dumps), **Configuration** (timezone, updates, shutdown, reporting, user-data, debconf-selections, zdevs). Optional: use MUI `Accordion` within each tab group to collapse/expand individual sections.
- **Consequences:**
  - Enables: Expert users (sysadmins) can navigate directly to the section they need; §05 building block view uses MUI `Tabs` as the primary navigation component.
  - Constrains: A guided wizard (Stepper) mode for novice users is not provided in v1; this is explicitly deferred.

---

### ADR-005: Technology stack rationale

- **Triggered by:** Q-8
- **Context:** The specification lists six core technology choices without rationale. §09 Architecture Decisions cannot be written without documented reasoning; the rationale is needed to evaluate future dependency upgrades or replacements.
- **Decision:** The six choices form a coherent, mutually-reinforcing stack designed for a complex form-heavy SPA with real-time output generation:
  - **React 18+**: Ecosystem breadth, MUI 6 dependency, concurrent rendering for live preview
  - **MUI 6**: Complete component set matching spec requirements 1:1; built-in WAI-ARIA compliance
  - **Context + Reducer**: Native state management for a single root config object; no external dependency required at this complexity level
  - **React Hook Form**: Uncontrolled components for performance across 26 form sections; native Zod integration
  - **Zod**: TypeScript-first schema inference; single source of truth for types and runtime validation
  - **`yaml` npm package**: YAML 1.2 compliance required for Netplan/cloud-init content; superior TypeScript types
- **Consequences:**
  - Enables: §09 can be written with substantive rationale; future dependency decisions have an explicit baseline to compare against.
  - Constrains: The stack is React-specific; migrating to another framework would require replacing MUI, React Hook Form, and potentially Zod integrations.

---

## Still Open

*No questions remain open. All 12 questions were resolved in this pass.*

*Note: Q-1, Q-2, and Q-4 were resolved with **medium** confidence. The derivations are strong, but an architect or product owner should review ADR-001, ADR-002, and ADR-004 before arc42 drafting begins. Run `/draft-adrs` to formalize these decisions.*
