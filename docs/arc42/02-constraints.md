# §02 Constraints

**Generated:** 2026-03-31
**Sources:** `SPEC.md` §Technische Basis, `architecture/questions/resolved-questions.md` (Q-6, Q-7), ADR-002, ADR-005

---

Constraints are conditions the architecture must respect and that cannot be changed within the
scope of the v1 project.

---

## 2.1 Technical Constraints

| Constraint | Rationale / Source |
|------------|-------------------|
| **Frontend framework: React 18+** | Specified in `SPEC.md` §Technische Basis. Required for MUI 6. |
| **Language: TypeScript** | Specified in `SPEC.md` §Technische Basis. Type-safe model for `AutoinstallConfig`. |
| **UI library: MUI 6** | Specified in `SPEC.md` §Technische Basis. Provides all required components (Tabs, Accordion, Dialog, TextField, Select, Switch, Checkbox, Table, AppBar). See ADR-005. |
| **State management: React Context + Reducer** | Specified in `SPEC.md` §Technische Basis. No external state library. See ADR-005. |
| **Form handling: React Hook Form** | Specified in `SPEC.md` §Technische Basis. Uncontrolled components for performance. See ADR-005. |
| **Validation: Zod** | Specified in `SPEC.md` §Technische Basis. TypeScript-first schema inference. See ADR-005. |
| **YAML serialization: `yaml` npm package** | Specified in `SPEC.md` §Technische Basis. Full YAML 1.2 compliance required for Netplan and cloud-init output. See ADR-005. |
| **Build tool: Vite** | Decided in ADR-002. CRA is deprecated; Vite is the current standard for React+TypeScript SPAs. |
| **Test runner: Vitest** | Follows from ADR-002 (Vitest is the natural test runner for Vite projects). |
| **Pure SPA — no backend** | The entire application runs client-side in the browser. No API, no server, no database. (SPEC.md, entire document; ADR-002) |
| **Static hosting only** | Follows from pure SPA constraint. Hosting target is GitHub Pages (ADR-002). No server-side execution. |
| **No runtime environment variables** | Pure SPA; all configuration is either hardcoded or derived client-side. (ADR-002) |
| **Normative schema: Canonical Autoinstall JSON Schema** | The embedded JSON Schema in `SPEC.md` §JSON Schema is the authoritative definition for valid `autoinstall.yaml` structure. Application field definitions must conform to it. |

---

## 2.2 Browser Support Constraint

**Target:** Evergreen browsers — last 2 major versions of Chrome, Firefox, Safari, and Edge.

**Explicitly excluded:** Internet Explorer 11 and all legacy browsers.

**Rationale:** The target audience (Ubuntu sysadmins, DevOps engineers) uses modern browsers.
The Clipboard API (`navigator.clipboard.writeText`) and all other browser APIs used by this
application are available in all evergreen browsers without polyfills. React 18+, MUI 6, and
Vite all target this same browser matrix. (Q-6, resolved)

**Build target:** Vite's default esbuild target (ES2015+), which aligns with this browser matrix.

---

## 2.3 Accessibility Constraint

**Standard:** WCAG 2.1 Level AA.

**Baseline:** MUI 6 components provide built-in WAI-ARIA compliance for standard form components
(`TextField`, `Select`, `Switch`, `Checkbox`, `Tabs`, `Dialog`, `AppBar`). This satisfies WCAG
2.1 AA requirements for these components without custom ARIA instrumentation.

**Manual requirements** — components requiring additional accessibility implementation:

| Component | Requirement |
|-----------|------------|
| `YamlEditorDialog` | Focus must be trapped within the Dialog when open; `aria-labelledby` must link the Dialog title; focus must return to the trigger button on close |
| YAML Preview panel | `aria-live="polite"` region to announce YAML changes to screen readers |
| Dynamic list fields (Snaps, Packages) | `aria-live` announcements when items are added or removed |

**CI enforcement:** `jest-axe` (axe-core) automated accessibility tests run in the GitHub Actions
CI pipeline. Zero critical violations are a required quality gate before any merge to `main`.
(Q-7, resolved; ADR-002)

---

## 2.4 Organizational Constraints

| Constraint | Source |
|------------|--------|
| **Open-source project** | The navigation bar includes an optional GitHub link (`SPEC.md` §Navigation), indicating the project is publicly hosted on GitHub. All contributions go through GitHub pull requests. |
| **No license prescribed** | No license file is specified in the source inventory. The maintainer should add an OSI-approved license before publication. |

> 📝 TODO: The project license has not been specified in any source document. The maintainer
> should decide on a license (MIT, Apache-2.0, or GPL) before the first public release.

---

## 2.5 Convention Constraints

| Convention | Rationale |
|------------|----------|
| `autoinstall:` as the YAML root key | Required by the Canonical Autoinstall specification. All generated YAML must wrap the configuration under `autoinstall:`. (SPEC.md, §YAML-Generierung) |
| `version: 1` | The Autoinstall schema's `version` field is currently `1` (JSON Schema constraint: `minimum: 1, maximum: 1`). This will require a manual update if Canonical introduces schema version 2. |
| Empty fields omitted from YAML output | Undefined fields in `AutoinstallConfig` must not appear in the generated YAML. (SPEC.md, §YAML-Generierung: "Leere Felder werden nicht serialisiert") |
| Zod schemas as the single source of truth | Zod schemas define both the TypeScript types (via `z.infer<>`) and the runtime validation rules. No separate type definitions that could diverge. (ADR-005) |

---

## Cross-References

- Why these constraints shape the solution: [§04 Solution Strategy](04-solution-strategy.md)
- Browser API constraints at runtime: [§06 Runtime View](06-runtime-view.md) (Clipboard API fallback)
- Quality requirements derived from accessibility constraint: [§10 Quality Requirements](10-quality-requirements.md)
- Technology choices that implement these constraints: [§09 Architecture Decisions](09-architecture-decisions.md)
