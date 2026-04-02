# §04 Solution Strategy

**Generated:** 2026-03-31
**Sources:** `SPEC.md` §Technische Basis, §Layout, §YAML-Generierung, §Validierung; ADR-001, ADR-002, ADR-004, ADR-005; `architecture/questions/resolved-questions.md` (Q-6, Q-7, Q-10)

---

## 4.1 Technology Decisions

The application is a **pure client-side single-page application** built with the following stack,
chosen as a coherent, mutually-reinforcing set:

| Layer | Technology | Rationale |
|-------|-----------|----------|
| Framework | React 18+ | Form-heavy SPA ecosystem; chosen for concurrent rendering (`useTransition`, `useDeferredValue`) and MUI 6 compatibility (MUI 6 supports React 17, 18, and 19). (ADR-005) |
| UI components | MUI 6 | 1:1 coverage of all spec-required components; built-in WAI-ARIA for WCAG 2.1 AA. (ADR-005) |
| Language | TypeScript | Type-safe `AutoinstallConfig` model; Zod schemas generate types at compile time. (SPEC.md, §Technische Basis) |
| State management | React Context + Reducer | Single root `AutoinstallConfig` object; well-defined action types; no external dependency. (ADR-005) |
| Form handling | React Hook Form | Uncontrolled components — no full-tree re-render per keystroke across 26 form sections. (ADR-005) |
| Validation | Zod | TypeScript-first; single source of truth for types and validation rules; native React Hook Form integration. (ADR-005) |
| YAML serialization | `yaml` npm package | Full YAML 1.2 compliance; required for Netplan and cloud-init content. (ADR-005) |
| Syntax highlighting | `react-syntax-highlighter` (PrismJS) | React-idiomatic; YAML grammar only; ~13 KB gzipped (estimated; verify with `vite build --report`). (ADR-003) |
| Build tool | Vite | Replaces deprecated CRA; native ECMAScript Modules (ESM), fast Hot Module Replacement (HMR), Rollup tree-shaking. (ADR-002) |
| Hosting | GitHub Pages (static) | Free for public repos; zero external SaaS dependency; no backend required. (ADR-002) |
| CI/CD | GitHub Actions | lint → type-check → Vitest → `vite build` → deploy. (ADR-002) |

See [§09 Architecture Decisions](09-architecture-decisions.md) for full ADR references.

---

## 4.2 UX Strategy

### Form-First with YAML Editor Escape Hatches

The primary UX metaphor is **structured forms**: the user configures Autoinstall sections via
typed form fields, and the YAML is generated invisibly in the background. The user never needs
to write YAML manually for the 24 sections that have known, bounded field structures.
(SPEC.md, §Ziel der Anwendung; ADR-001)

For two sections that are structurally unbounded, **YAML editor escape hatches** are provided
as MUI Dialog modals:

- **Network** — Netplan YAML (the Netplan schema is open-ended; a full structured editor
  would be a project in itself)
- **Storage Action mode** — Autoinstall action list YAML (explicitly unschemaed in the official
  JSON Schema)

The User-Data section uses a **structured form** scoped to the cloud-init `users` module —
providing a better UX than a free-form YAML editor for this bounded use case. (ADR-001)

This hybrid model is intentional and documented. The §01 goal statement reflects it: "Most
Autoinstall fields are covered via structured UI components; Network and Storage Action mode
use embedded YAML editors as intentional escape hatches."

### Expert-User Tab Navigation

The 26 Autoinstall form sections are organized into **6 logical Tab groups** using MUI Tabs.
Navigation between groups is non-sequential — users can jump directly to any section.

This navigation design is optimized for the target audience: expert sysadmins and DevOps
engineers (inferred from application purpose) who know which sections they need to configure
and do not want to step linearly through 26 sections. (ADR-004)

| Tab Group | Sections | Theme |
|-----------|---------|-------|
| **System** | version, interactive-sections, refresh-installer, early-commands, late-commands, error-commands | Installation lifecycle control |
| **Network** | network (escape hatch), proxy | Network configuration |
| **Storage** | storage (layout form + action escape hatch) | Disk layout |
| **Identity & Auth** | identity, active-directory, ubuntu-pro, ssh | User and authentication setup |
| **Software** | source, apt, codecs, drivers, oem, snaps, packages, kernel, kernel-crash-dumps | Package and software configuration |
| **Configuration** | timezone, updates, shutdown, reporting, user-data, debconf-selections, zdevs | Post-install system behavior |

Within each Tab group, individual sections are wrapped in **MUI Accordion** components for
expand/collapse without a page transition. (ADR-004)

### Two-Column Layout

The Form Editor uses a **two-column layout**: form sections on the left, live YAML preview on
the right. On mobile devices, the YAML preview stacks below the form. (SPEC.md, §Layout)

---

## 4.3 Data Strategy

### Single Root State Object

All application state is represented as a single `AutoinstallConfig` TypeScript object, managed
by a React Context + Reducer. (SPEC.md, §Datenmodell; ADR-005)

```typescript
// State transitions via well-defined action types, e.g.:
// { type: 'SET_LOCALE', payload: 'en_US.UTF-8' }
// { type: 'SET_NETWORK', payload: '<raw netplan yaml string>' }
// { type: 'RESET' }
```

**Escape-hatch fields** (Network and Storage Action mode) are stored as raw YAML strings in the
reducer state (`network?: any`, `storage.actions?: string` — raw YAML). These are serialized
verbatim into the final YAML output. (ADR-001, §08)

### Live YAML Generation

On every state change, the `AutoinstallConfig` object is passed through `yaml.stringify()` and
rendered in the YAML Preview panel via `react-syntax-highlighter`. Empty fields are omitted.
(SPEC.md, §YAML-Generierung)

The update path is synchronous:

```
State change → Reducer → New state → yaml.stringify() → SyntaxHighlighter render
```

Target latency for this path: < 50 ms. (Q-10, resolved)

React 18's `useDeferredValue` can be applied to defer the YAML re-render if profiling reveals
input lag on low-end devices. `useDeferredValue` is the appropriate hook here because the YAML
string is a derived value from the config state; `useTransition` is for action-based transitions.

### Validation Strategy

- **Per-section Zod schemas** validate each section's fields
- **Required field gates**: `version`, `identity.username`, `identity.hostname`,
  `identity.password` (unless user-data is provided) must be filled before export
- **Escape-hatch YAML**: A YAML parse check at Dialog close time catches syntax errors in
  Network and Storage Action mode content (Zod cannot validate free-form YAML strings)
- **No server-side validation** — all validation is client-side

(SPEC.md, §Validierung; ADR-001)

---

## 4.4 Quality Strategy

| Quality Goal | Architectural Response |
|-------------|----------------------|
| **Correctness** | Zod schemas per section; Canonical JSON Schema embedded for structural reference; required field gates before export |
| **Performance** | React Hook Form uncontrolled components (no re-renders per keystroke); Vite + MUI tree-shaking for < 500 KB bundle; React 18 `useDeferredValue` for YAML preview if needed |
| **Accessibility** | MUI 6 WAI-ARIA baseline; manual ARIA for `YamlEditorDialog` focus trap and YAML Preview `aria-live`; `jest-axe` CI gate |
| **Browser compatibility** | Vite ES2015+ target; Clipboard API with `<textarea>` fallback for non-HTTPS contexts |
| **Maintainability** | Zod schemas as single source of truth; TypeScript model matches Canonical schema structure; schema drift risk documented in §11 |

---

## Cross-References

- Technology constraint details: [§02 Constraints](02-constraints.md)
- Component structure: [§05 Building Block View](05-building-block-view.md)
- Interaction scenarios: [§06 Runtime View](06-runtime-view.md)
- Crosscutting implementation patterns: [§08 Crosscutting Concepts](08-crosscutting-concepts.md)
- Quality SLOs: [§10 Quality Requirements](10-quality-requirements.md)
- ADR details: [§09 Architecture Decisions](09-architecture-decisions.md)
