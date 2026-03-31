# §08 Crosscutting Concepts

**Generated:** 2026-03-31
**Sources:** `SPEC.md` §Technische Basis, §Datenmodell, §Layout, §Validierung, §YAML-Generierung, §Komponenten; ADR-001, ADR-002, ADR-003, ADR-005; `architecture/questions/resolved-questions.md` (Q-7)

---

Crosscutting concepts are patterns that appear in multiple building blocks and are implemented
consistently across the application.

---

## State Management

**Pattern:** React Context + Reducer with a single root state object.

The entire application state is a single `AutoinstallConfig` object. All mutations flow through
a reducer with well-defined action types. No component modifies state directly.

```typescript
// Reducer action type naming convention
type AutoinstallAction =
  | { type: 'SET_VERSION'; payload: number }
  | { type: 'SET_LOCALE'; payload: string }
  | { type: 'SET_NETWORK'; payload: string }     // raw Netplan YAML string
  | { type: 'SET_STORAGE_LAYOUT'; payload: StorageLayoutConfig }
  | { type: 'SET_STORAGE_ACTIONS'; payload: string }  // raw action YAML string
  | { type: 'SET_IDENTITY'; payload: Partial<IdentityConfig> }
  // ... one action type per section or group of related fields
  | { type: 'RESET' };  // resets all state to defaults
```

**Escape-hatch fields** (Network, Storage Action mode) are stored as raw YAML strings in the
reducer state. These are serialized verbatim into the final YAML output — they are not passed
through the `yaml` package's object serialization. (ADR-001)

```typescript
// How escape-hatch fields appear in the state
interface AutoinstallConfig {
  network?: any;      // stores raw Netplan YAML string when escape hatch is used
  // ...
}
```

**Context access:** All components access state via a `useAutoinstallConfig()` custom hook that
wraps `useContext(AutoinstallConfigContext)`. Direct `useContext` calls in components are avoided
to enable easier refactoring.

(Source: SPEC.md §Technische Basis, §Datenmodell; ADR-005)

---

## Form Handling

**Pattern:** React Hook Form with per-section Zod resolver, using uncontrolled components.

Each section form component registers its fields with React Hook Form using `register()` or
`Controller`. Form state is local to each section; section-level changes are submitted to the
global reducer on change (using `watch()` with a debounce or `onChange` mode).

```typescript
// Per-section pattern (example: IdentityForm)
const schema = z.object({
  username: z.string().min(1, 'Required'),
  hostname: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
  realname: z.string().optional(),
});

const { register, formState: { errors }, watch } = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange',
});

// Dispatch to global reducer on valid section state change
const values = watch();
useEffect(() => {
  dispatch({ type: 'SET_IDENTITY', payload: values });
}, [values]);
```

**Performance:** React Hook Form's uncontrolled component model means individual field keystrokes
do not trigger re-renders of sibling fields or other sections. The cost of a state change is
limited to: the field itself + the active section (via `watch`) + `YamlPreviewPanel` (via
context subscription). (ADR-005)

(Source: SPEC.md §Technische Basis; ADR-005)

---

## Validation

**Pattern:** Zod schemas per section; inline error display; required-field gate before export.

**Per-section validation:** Each section form has a Zod schema. Validation runs `onChange` or
`onBlur`. Errors are displayed inline below the respective field using MUI's `error` and
`helperText` props on `TextField` / `FormHelperText`. (SPEC.md, §Validierung)

**Required fields gate:** Before export (Download or Copy), the application validates:
- `version` is set
- `identity.username`, `identity.hostname`, `identity.password` are set (unless `user-data`
  is provided)

If required fields are missing, export is blocked and the user is directed to the missing
section. (SPEC.md, §Validierung)

**Escape-hatch YAML validation:** When the user confirms a YAML editor dialog (Network or Storage
Action mode), the entered text is passed through `yaml.parse()`. If parsing fails, an error
message is shown in the dialog and the dialog remains open. This is the only validation for
escape-hatch sections — Zod cannot validate free-form YAML strings. (ADR-001)

**No server-side validation.** All validation is client-side and synchronous. (§02 Constraints)

---

## YAML Serialization

**Pattern:** `yaml.stringify()` for structured fields; verbatim string inclusion for escape-hatch fields.

**Structured sections:** All typed `AutoinstallConfig` fields (including the `users` module of
`user-data`) are passed through `yaml.stringify()`. Empty fields (`undefined`) are automatically
omitted by the `yaml` package. (SPEC.md, §YAML-Generierung)

**Escape-hatch fields (Network, Storage Action mode):** The raw YAML string stored in the
reducer is serialized verbatim into the output. It is not re-parsed and re-stringified. The
`yaml` package's ability to emit literal block scalars can be used to embed the raw string
as a literal YAML block within the structured output.

**Output wrapper:** The generated YAML is wrapped under the `autoinstall:` root key as required
by the Canonical Autoinstall specification. (SPEC.md, §YAML-Generierung)

```yaml
# Example output structure
autoinstall:
  version: 1
  identity:
    username: ubuntu
    hostname: myserver
    password: "$6$..."
  network:
    # (raw Netplan YAML serialized verbatim here)
    version: 2
    ethernets:
      enp3s0:
        dhcp4: true
```

(Source: SPEC.md §YAML-Generierung; ADR-001; ADR-005)

---

## Syntax Highlighting

**Pattern:** `react-syntax-highlighter` component with PrismJS backend; YAML grammar only.

The YAML Preview panel renders the generated YAML string in a `SyntaxHighlighter` component.
The component is read-only — it is a display panel, not an editor.

```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Usage in YamlPreviewPanel
<SyntaxHighlighter language="yaml" style={vscDarkPlus}>
  {yamlString}
</SyntaxHighlighter>
```

The import path (`/dist/esm/styles/prism`) is the deep ESM import required for tree-shaking
to avoid bundling the Highlight.js backend alongside PrismJS. (ADR-003)

**Bundle contribution:** PrismJS YAML grammar (~8 KB gzipped) + one theme (~5 KB) = ~13 KB total.

(Source: ADR-003; SPEC.md §YAML-Preview, §Technische Basis)

---

## Accessibility

**Pattern:** MUI 6 WAI-ARIA as baseline; manual requirements for dynamic components; `jest-axe` CI gate.

**Baseline:** MUI 6 components (`TextField`, `Select`, `Switch`, `Checkbox`, `Tabs`, `Dialog`,
`Accordion`, `AppBar`, `Table`) implement WAI-ARIA patterns by default. No custom ARIA
instrumentation is required for these components.

**Manual ARIA requirements:**

| Component | Requirement | Implementation |
|-----------|------------|---------------|
| `YamlEditorDialog` | Focus trap on open; focus return to trigger on close | MUI Dialog provides focus trap via `disablePortal={false}` and `keepMounted={false}` by default |
| `YamlEditorDialog` | Dialog title accessible to screen readers | `aria-labelledby` linking Dialog `id` to title `id` |
| `YamlPreviewPanel` | YAML changes announced to screen readers | `aria-live="polite"` wrapper around the `SyntaxHighlighter` |
| Snaps / Packages tables | "Item added" / "Item removed" announcements | `aria-live="polite"` region updated on list mutation |

**CI enforcement:** `jest-axe` (axe-core) is run in the Vitest test suite. Each component has
an axe-core test. Zero critical violations are required before a merge to `main`. (ADR-002; Q-7, resolved)

(Source: Q-7, resolved; §02 Constraints — Accessibility)

---

## Responsive Layout

**Pattern:** MUI Grid or CSS Flexbox two-column layout with a single breakpoint.

- **Desktop (≥ `md` breakpoint):** Form sections on the left, YAML preview panel on the right.
  The two-column split is approximately 60/40 or 50/50 (implementation detail).
- **Mobile (< `md` breakpoint):** YAML preview panel stacks below the form sections.

(Source: SPEC.md §Layout — "Zweispaltig (Formular links, YAML-Preview rechts); Responsive: YAML-Preview unterhalb auf mobilen Geräten")

> ⚠️ Inferred: MUI's `Grid` or `Box` with `flexDirection` is the natural implementation.
> The exact breakpoint value (MUI's `md` = 900px by default) is an implementation decision.

---

## Development Experience

**Pattern:** Vite dev server with HMR; Vitest as test runner; single `vite.config.ts`.

- **Local development:** `npm run dev` starts the Vite dev server at `localhost:5173` with Hot
  Module Replacement (HMR). React component changes are reflected in the browser within
  milliseconds without a full page reload.
- **Test runner:** Vitest uses the same `vite.config.ts` as the dev server and build, avoiding
  configuration duplication. The `@testing-library/react` and `jest-axe` test libraries are
  Jest-compatible and work natively with Vitest.
- **Type checking:** `tsc --noEmit` runs in the CI pipeline. TypeScript strict mode is enabled.
- **Linting:** ESLint with the React + TypeScript rule set.

(Source: ADR-002)

---

## Error Handling

**Pattern:** No global error boundary is defined in v1 (pure SPA with no async operations).

Since the application has no network calls, no async data fetching, and no server-side operations,
the primary error surfaces are:

1. **Form validation errors** — handled inline by Zod + React Hook Form (see Validation above)
2. **YAML parse errors in escape-hatch dialog** — handled with inline error message in the dialog
3. **Clipboard API unavailability** — handled with `<textarea>` fallback (see §06 Scenario 4)
4. **File download failure** — no known failure mode for `URL.createObjectURL` in evergreen browsers

A React error boundary (`componentDidCatch`) should be added as a safety net to catch unexpected
runtime errors and display a user-friendly fallback. This is a v1 implementation detail.

> ⚠️ Inferred: Error boundary is not specified in the source documents but is a standard React
> pattern for production applications.

---

## Cross-References

- Component structure: [§05 Building Block View](05-building-block-view.md)
- Interaction scenarios: [§06 Runtime View](06-runtime-view.md)
- Deployment and CI pipeline: [§07 Deployment View](07-deployment-view.md)
- Technology choices (React Hook Form, Zod, yaml, PrismJS): [§09 Architecture Decisions — ADR-005](09-architecture-decisions.md#adr-005-technology-stack-rationale), [ADR-003](09-architecture-decisions.md#adr-003-syntax-highlighting--prismjs)
