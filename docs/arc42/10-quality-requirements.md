# §10 Quality Requirements

**Generated:** 2026-03-31
**Sources:** `SPEC.md` §Ziel der Anwendung, §YAML-Preview, §Layout, §Validierung; `architecture/questions/resolved-questions.md` (Q-6, Q-7, Q-10); ADR-002, ADR-005

---

## 10.1 Quality Tree

```
Quality
├── Correctness
│   ├── YAML schema validity (Canonical JSON Schema)
│   └── Required field enforcement (version, identity)
├── Performance
│   ├── YAML preview update latency (< 50 ms)
│   ├── Initial page load — LCP (< 2 s)
│   ├── Bundle size (< 500 KB gzipped JS)
│   └── Form validation latency (< 100 ms)
├── Usability
│   ├── Expert navigation (direct access to any of 26 sections)
│   └── Responsive layout (desktop two-column, mobile stacked)
├── Accessibility
│   ├── WCAG 2.1 Level AA compliance
│   └── Automated axe-core CI gate (zero critical violations)
└── Maintainability
    ├── Autoinstall schema drift management
    └── TypeScript strict mode + single source of truth (Zod schemas)
```

---

## 10.2 Quality Attribute SLOs

| # | Quality Attribute | SLO | Measurement | Rationale |
|---|-------------------|-----|-------------|----------|
| QA-1 | **YAML generation correctness** | Generated YAML passes Canonical Autoinstall JSON Schema validation | `ajv` or `jsonschema` validation in test suite | Primary application goal (SPEC.md §Ziel der Anwendung) |
| QA-2 | **Required field enforcement** | `version`, `identity.username`, `identity.hostname`, `identity.password` are validated before export | Unit tests + E2E tests | SPEC.md §Validierung |
| QA-3 | **YAML preview update latency** | < 50 ms from input change to YAML re-render in the browser | React DevTools Profiler; `performance.now()` measurements | YAML generation is synchronous; 50 ms is imperceptible lag (Q-10, resolved) |
| QA-4 | **Initial page load (LCP)** | < 2 s on a mid-range device over 4G | Lighthouse CI in GitHub Actions | Core Web Vitals "Good" threshold; achievable with Vite + MUI tree-shaking (Q-10, resolved) |
| QA-5 | **Bundle size** | < 500 KB gzipped JavaScript | `vite build` + `gzip -l dist/assets/*.js` | Ensures fast initial load on limited connections (Q-10, resolved) |
| QA-6 | **Form validation latency** | < 100 ms after input blur | Zod validation is synchronous; target is conservative | SPEC.md §Validierung — inline error display; synchronous Zod ensures this is easily met (Q-10, resolved) |
| QA-7 | **Accessibility** | Zero critical axe-core violations | `jest-axe` in Vitest CI pipeline | WCAG 2.1 AA standard (Q-7, resolved; ADR-002) |
| QA-8 | **Browser compatibility** | App is fully functional in last 2 major versions of Chrome, Firefox, Safari, Edge | Manual testing + BrowserStack (optional) | Target audience uses modern browsers; IE11 excluded (Q-6, resolved) |

---

## 10.3 Quality Scenarios

### QA-3: YAML Preview Latency

| Element | Description |
|---------|-------------|
| **Source** | Sysadmin typing in the Hostname field of the Identity section |
| **Stimulus** | Each keystroke updates the `identity.hostname` value |
| **Environment** | Mid-range laptop, Chrome, normal operation |
| **Artifact** | `YamlPreviewPanel` — `yaml.stringify()` + PrismJS re-render |
| **Response** | Updated YAML preview is visible in the browser |
| **Response measure** | < 50 ms from keystroke to visible YAML update |
| **Architectural response** | React Hook Form uncontrolled components; synchronous `yaml.stringify()`; React 18 `useDeferredValue` as safety valve if needed |

---

### QA-4: Initial Page Load

| Element | Description |
|---------|-------------|
| **Source** | New user opening the application URL for the first time |
| **Stimulus** | HTTP GET to GitHub Pages |
| **Environment** | Mid-range mobile device, 4G connection (20 Mbps, 40 ms RTT) |
| **Artifact** | SPA bundle (`dist/assets/`) served from GitHub Pages CDN |
| **Response** | Largest Contentful Paint (LCP) renders — app is interactive |
| **Response measure** | LCP < 2 s |
| **Architectural response** | Vite Rollup tree-shaking; MUI named imports (only used components); PrismJS YAML grammar only; React lazy-loading for non-critical sections (optional optimization) |

---

### QA-7: Accessibility — YAML Editor Dialog

| Element | Description |
|---------|-------------|
| **Source** | Screen reader user activating the "Edit Network YAML" button |
| **Stimulus** | Button click opens `YamlEditorDialog` |
| **Environment** | Chrome + NVDA (Windows) or Safari + VoiceOver (macOS) |
| **Artifact** | `YamlEditorDialog` (MUI Dialog + textarea) |
| **Response** | Dialog opens; screen reader announces dialog title; focus moves to textarea; user can edit; on Confirm/Cancel, focus returns to trigger button; dialog closure is announced |
| **Response measure** | Zero axe-core critical violations; manual screen reader test passes |
| **Architectural response** | MUI Dialog focus trap; `aria-labelledby`; `aria-describedby` for instructions; focus return on close |

---

### QA-1: YAML Schema Validity

| Element | Description |
|---------|-------------|
| **Source** | User who has filled in all required fields and clicks "Download" |
| **Stimulus** | Export triggered; `yaml.stringify(state)` called |
| **Environment** | Any browser, any OS |
| **Artifact** | Generated `autoinstall.yaml` content |
| **Response** | The YAML file is valid against the Canonical Autoinstall JSON Schema |
| **Response measure** | `ajv.validate(schema, parsedYaml) === true` in the test suite for all valid `AutoinstallConfig` inputs |
| **Architectural response** | Zod schemas enforce types at runtime; Canonical JSON Schema embedded for reference; test suite validates generated YAML for all section combinations |

---

## 10.4 Quality Attributes Not Targeted

The following are explicitly **not** quality targets for v1:

| Quality Attribute | Rationale |
|-------------------|----------|
| **Server-side performance** | No backend; not applicable |
| **Security (authentication, authorization)** | No user accounts or sensitive data; not applicable |
| **Localization / i18n** | Deferred to v2 (SPEC.md §Erweiterbarkeit) |
| **Offline capability (PWA)** | Not specified; deferred if needed |
| **WCAG 2.1 Level AAA** | AA is the target; AAA is aspirational but not required |

---

## Cross-References

- Quality goals summary: [§01 Introduction and Goals](01-introduction-and-goals.md)
- Accessibility constraint: [§02 Constraints](02-constraints.md)
- CI pipeline (where quality gates are enforced): [§07 Deployment View](07-deployment-view.md)
- Crosscutting implementation for quality (React Hook Form performance, Zod validation, a11y): [§08 Crosscutting Concepts](08-crosscutting-concepts.md)
- Risks to these quality targets: [§11 Risks and Technical Debt](11-risks-and-technical-debt.md)
