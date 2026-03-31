# ADR-005: Technology Stack Rationale

**Status:** Proposed
**Date:** 2026-03-31
**Triggered by:** Q-8 (resolved-questions.md)

---

## Context

The application specification (`SPEC.md`, §Technische Basis) lists six core technology choices
without rationale:

1. React 18+
2. MUI 6
3. React Context + Reducer
4. React Hook Form
5. Zod
6. `yaml` npm package (by Eemeli Aro)

The §09 Architecture Decisions section of the arc42 documentation cannot be written without
documented reasoning for these choices. Future dependency upgrade decisions, replacements, or
framework migrations require an explicit baseline to compare against.

This ADR documents the retrospective rationale for each choice based on architectural derivation
from the application's requirements and the known properties of the listed libraries.

**context7 validation:** context7 is not available in this environment. The library descriptions
and API statements below are based on the resolution analysis in `resolved-questions.md` (Q-8)
and are consistent with the libraries' documentation as of 2025.

---

## Application Characteristics Driving the Stack

The stack choices are coherent when viewed against the application's key characteristics:

1. **Complex, deeply-nested form** — 26 Autoinstall sections with field-level validation
2. **Single root state object** — the entire `AutoinstallConfig` TypeScript interface is the
   application's state; it is progressively built up by user input
3. **Live output generation** — every form input change immediately regenerates the YAML preview
4. **Pure client-side SPA** — no backend, no authentication, no persistence
5. **TypeScript-first** — the spec provides a TypeScript data model; type safety is a design goal
6. **YAML 1.2 output** — the generated YAML must be valid for Netplan and cloud-init consumers
   that use YAML 1.2 features

---

## Decision

The six technology choices are adopted as specified in `SPEC.md`. The rationale for each is
documented below.

### React 18+

**Rationale:**

- **Ecosystem breadth for form-heavy SPAs**: React has the largest ecosystem of form libraries,
  state management patterns, and UI component libraries. For a 26-section form with complex
  validation, the React ecosystem's maturity is a meaningful advantage.
- **MUI 6 dependency**: MUI 6 targets React 18+. Choosing React 18+ is a prerequisite for using
  MUI 6, which is the specified UI library.
- **Concurrent rendering for live preview**: React 18's `useTransition` and `useDeferredValue`
  hooks allow the YAML preview update to be scheduled as a non-urgent update, preventing form
  input from feeling sluggish on low-end devices if YAML generation ever becomes expensive.
- **Alternative frameworks considered**: Vue 3 and Svelte are viable SPA frameworks, but MUI 6
  is a React-only library. Rebuilding an equivalent component set for Vue 3 or Svelte would
  significantly increase implementation risk for a first-party project.

### MUI 6

**Rationale:**

- **Complete component coverage**: MUI 6 provides, in a single package, every UI component listed
  in `SPEC.md` §Komponenten: `TextField`, `Select`, `Switch`, `Checkbox`, `Tabs`, `Stepper`,
  `Accordion`, `Table`, `Dialog`, `AppBar`. This is a 1:1 mapping of the spec's component
  inventory to a single library, with no gap components requiring a second library.
- **Built-in WAI-ARIA compliance**: MUI 6 is designed with ARIA compliance as a first-class
  concern, satisfying the WCAG 2.1 AA accessibility requirement (see Q-7) without custom
  ARIA instrumentation for standard form components.
- **Alternatives considered**:
  - `shadcn/ui`: Requires assembling components from Radix UI primitives. `Tabs`, `Accordion`,
    and `Dialog` are available, but there is no maintained `Stepper` or complex `Table` component.
    Assembly from primitives increases implementation effort.
  - Chakra UI v3: Lacks a `Stepper` and a full-featured `Table` equivalent. Accessibility is
    good but MUI's WAI-ARIA coverage for form components is more comprehensively documented.
  - Ant Design: Viable, but targeting a design language optimized for enterprise dashboards
    (Chinese design aesthetic); less aligned with a developer tool aesthetic.

### React Context + Reducer

**Rationale:**

- **Single root state object**: The application's state is a single, deeply-nested
  `AutoinstallConfig` object (see `SPEC.md`, §Datenmodell). This is the canonical use case for a
  reducer pattern: well-defined action types (e.g., `SET_LOCALE`, `SET_NETWORK`, `RESET`),
  predictable state transitions, and straightforward unit testability.
- **Appropriate complexity level**: Context + Reducer is a native React pattern that handles this
  state complexity well. Adding Redux Toolkit would introduce a significant dependency for a
  problem that Context + Reducer solves without external libraries.
- **Alternatives considered**:
  - Redux Toolkit: Adds dependency overhead (redux, react-redux, @reduxjs/toolkit) for a problem
    that native React Context handles at this scale. The DevTools integration is valuable but not
    worth the dependency cost for a focused single-purpose app.
  - Zustand: A lightweight external state library. Valid alternative, but introduces a dependency
    for a complexity level that Context + Reducer handles natively.
  - Jotai: Atom-based state. More granular than needed for a single root config object; the atomic
    model adds conceptual overhead without a clear benefit for a single-tree state.

### React Hook Form

**Rationale:**

- **Uncontrolled components for performance**: React Hook Form uses native HTML form controls
  (uncontrolled components via `ref`), meaning individual field changes do NOT cause the entire
  form tree to re-render. For a 26-section form with hundreds of fields, this is a meaningful
  performance advantage over Formik's controlled-component model where every keystroke triggers
  a full form re-render.
- **Native Zod integration**: The `@hookform/resolvers/zod` package connects Zod validation
  schemas to React Hook Form with no glue code. Validation errors are surfaced directly to
  the form's `errors` object.
- **Alternative considered**:
  - Formik: Controlled-component model re-renders the entire form on every keystroke. For a
    26-section form, this is a known performance bottleneck. Formik is also not actively
    maintained at the same velocity as React Hook Form.

### Zod

**Rationale:**

- **TypeScript-first schema inference**: `z.infer<typeof schema>` generates TypeScript types
  directly from Zod schemas. This eliminates duplicate type definitions — the Zod schema is the
  single source of truth for both TypeScript types (compile-time) and runtime validation.
- **Single source of truth**: The `AutoinstallConfig` TypeScript interface (from `SPEC.md`
  §Datenmodell) can be derived directly from the Zod schema, ensuring types and validation rules
  stay in sync.
- **First-class React Hook Form integration**: `@hookform/resolvers/zod` provides a direct
  integration path.
- **Alternatives considered**:
  - `yup`: JavaScript-first; TypeScript types are a secondary concern and require additional
    type assertions. The Zod API is more ergonomic for TypeScript-first development.
  - `valibot`: A newer library with a smaller API surface and bundle size. Valid technical choice,
    but smaller ecosystem and fewer production deployments. Zod's ecosystem (react-hook-form
    integration, community schema libraries) is more mature.

### `yaml` npm Package (by Eemeli Aro)

**Rationale:**

- **YAML 1.2 compliance**: The application generates `autoinstall.yaml` files where the `network`
  section is Netplan YAML and the `user-data` section is cloud-init YAML. Both Netplan and
  cloud-init are processed by tools that use YAML 1.2 features including anchors (`&`), aliases
  (`*`), merge keys (`<<`), and tags (`!!`). YAML 1.1-based parsers (`js-yaml`'s default mode)
  may mishandle these features. The `yaml` package implements the full YAML 1.2 specification.
- **Superior TypeScript types**: The `yaml` package has first-class TypeScript types built in.
  `js-yaml` requires `@types/js-yaml` as a separate `devDependency`.
- **Active maintenance**: The `yaml` package is actively maintained with a responsive maintainer.
- **Alternative considered**:
  - `js-yaml`: Higher weekly download count due to historical momentum (many build tools depend
    on it transitively), but targets YAML 1.2 only partially. The `yaml` package was specifically
    designed for full YAML 1.2 compliance and is the recommended choice for new projects where
    YAML 1.2 fidelity matters.

---

## Consequences

### Positive

- §09 can be written with substantive rationale for all six technology choices.
- Future dependency upgrade or replacement decisions have an explicit baseline: any replacement
  must satisfy the same criteria documented here.
- The stack's internal coherence is documented: React 18+ enables MUI 6 and React Hook Form;
  Zod integrates with React Hook Form; `yaml` handles YAML 1.2 for the escape-hatch sections.

### Negative

- The stack is **React-specific**. Migrating to another frontend framework (Vue, Svelte, Angular)
  would require replacing MUI 6 (React-only), React Hook Form (React-only), and potentially
  the Zod + React Hook Form resolver integration.
- The `yaml` package's YAML 1.2 compliance is only relevant for the escape-hatch sections
  (Network, User-Data). For the structured form sections, a simpler YAML 1.1 serializer would
  also work. However, using a single YAML serializer for the entire output is architecturally
  simpler than mixing serializers.

### Neutral

- The documented rationale is **retrospective** — it documents why these choices are coherent,
  not the original decision-maker's actual reasoning. The original rationale is unconfirmed.
- This ADR does not cover Vite (ADR-002), syntax highlighting (ADR-003), or form navigation
  (ADR-004), which are separate architectural decisions.

---

## Arc42 Impact

| Section | Impact |
|---------|--------|
| §09 | This ADR provides the substantive rationale body for all six technology choices; resolves the "choices listed, no rationale" gap identified in §00-source-inventory.md |
| §08 | Crosscutting concepts for state management (Context + Reducer), form handling (React Hook Form), validation (Zod), and YAML serialization (`yaml` package) can reference this ADR for rationale |

---

## References

- `SPEC.md`, §Technische Basis — all six technology choices listed
- `SPEC.md`, §Datenmodell — `AutoinstallConfig` interface; `network?: any`, `userData?: any`
- `SPEC.md`, §Komponenten — MUI component inventory mapping
- `SPEC.md`, §Validierung — Zod validation requirements
- `architecture/questions/resolved-questions.md`, Q-8
- [React 18 release notes](https://react.dev/blog/2022/03/29/react-v18)
- [MUI v6 documentation](https://mui.com)
- [React Hook Form documentation](https://react-hook-form.com)
- [Zod documentation](https://zod.dev)
- [yaml npm package](https://www.npmjs.com/package/yaml)
