# ADR-003: Syntax Highlighting — PrismJS via react-syntax-highlighter

**Status:** Proposed
**Date:** 2026-03-31
**Triggered by:** Q-3 (resolved-questions.md)

---

## Context

The application specification (`SPEC.md`, §Technische Basis) lists "PrismJS oder Highlight.js" for
syntax highlighting without making a decision. A concrete library choice is required before the
YAML Preview component can be implemented.

The YAML Preview panel (`SPEC.md`, §YAML‑Preview) provides a live, syntax-highlighted view of the
generated `autoinstall.yaml`. Syntax highlighting applies to **exactly one language: YAML**. The
application never highlights any other language.

**Comparison of options:**

| Criterion | PrismJS | Highlight.js |
|-----------|---------|-------------|
| Architecture | Modular: grammars are separate imports | Monolithic by default; tree-shaking requires manual configuration |
| Bundle size (YAML only) | ~8 KB (YAML grammar + Prism core) | ~40+ KB (all languages included by default unless manually trimmed) |
| React integration | `react-syntax-highlighter` (primary backend); `prism-react-renderer` | `react-highlight`; also supported by `react-syntax-highlighter` |
| TypeScript types | `@types/prismjs` — well-maintained | `@types/highlight.js` — adequate |
| YAML grammar quality | Full YAML 1.2 support including multi-line scalars, anchors, aliases | Good YAML support; anchor/alias rendering is less reliable |
| Weekly downloads (2025) | `react-syntax-highlighter`: 3.5M+ | `react-highlight`: 50K–100K |
| Maintenance | Actively maintained; React integration via `react-syntax-highlighter` is the standard | `react-highlight` is less actively maintained |

**`react-syntax-highlighter`** is the standard React ecosystem wrapper. It supports both PrismJS
and Highlight.js as backends and exposes an identical React component API for both. Switching
backends later does not require changing the component interface.

**Bundle size** is a meaningful concern: the application has a target of < 500 KB gzipped JS
(see Q-10). Importing only the PrismJS YAML grammar (~8 KB) and a single theme keeps the
syntax highlighting contribution minimal. Highlight.js without manual tree-shaking adds 40+ KB.

**context7 validation:** context7 is not available in this environment. The bundle size figures
and API descriptions above are based on the resolution analysis in `resolved-questions.md` (Q-3)
and are consistent with the libraries' npm pages and documentation as of 2025.

---

## Decision

Use **`react-syntax-highlighter`** with the **PrismJS backend**.

- Import only the YAML grammar: `import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'`
- Import only one theme (e.g., `prism` or `vscDarkPlus` from `react-syntax-highlighter/dist/esm/styles/prism`)
- Language: `'yaml'` — no other languages are needed

This provides a React-idiomatic API, avoids direct DOM manipulation, enables tree-shaking to
minimize bundle impact, and retains the option to switch to the Highlight.js backend without API
changes if required.

---

## Consequences

### Positive

- The YAML Preview component has a concrete, React-idiomatic implementation path.
- §08 crosscutting concept for syntax highlighting is fully specified: library, backend, import
  pattern, and bundle size impact.
- Bundle size contribution is bounded: PrismJS YAML grammar (~8 KB gzipped) + one theme (~5 KB).
- PrismJS's modular grammar system means that if the application ever needs to highlight another
  language (e.g., shell commands in `early-commands`), the additional grammar can be imported
  without changing the architecture.
- `react-syntax-highlighter` is the community-standard React wrapper with 3.5M+ weekly downloads,
  ensuring long-term maintenance and compatibility with future React versions.

### Negative

- An external dependency (`react-syntax-highlighter`) is added. Its bundle includes both PrismJS
  and Highlight.js backends; tree-shaking via deep imports (`react-syntax-highlighter/dist/esm/...`)
  is required to avoid pulling in both backends.
- The Prism YAML grammar has known edge cases with very large YAML files (multi-MB). For the use
  case of `autoinstall.yaml` generation, files are unlikely to exceed a few KB, so this is not
  a practical concern.

### Neutral

- If the Highlight.js backend is later preferred (e.g., for a specific theme or language support
  need), switching only requires changing the import path; the JSX component usage is unchanged.
- Theme selection is a design decision (not architectural); it can be changed at any time by
  swapping the theme import.

---

## Arc42 Impact

| Section | Impact |
|---------|--------|
| §08 | Syntax highlighting crosscutting concept: `react-syntax-highlighter` (PrismJS backend), YAML grammar only, one theme; bundle size ~13 KB gzipped |
| §09 | This ADR is the record for the PrismJS decision |

---

## Alternatives Considered

### Alternative A: Highlight.js via react-highlight

- **Description:** Use Highlight.js with the `react-highlight` React wrapper.
- **Rejected because:** `react-highlight` has significantly fewer weekly downloads (~50–100K vs.
  3.5M+ for `react-syntax-highlighter`) and is less actively maintained. Highlight.js includes all
  language grammars by default, requiring manual tree-shaking to stay within the bundle size target.
  PrismJS's modular architecture is the better fit for a single-language use case.

### Alternative B: Highlight.js via react-syntax-highlighter (Highlight.js backend)

- **Description:** Use `react-syntax-highlighter` with the Highlight.js backend instead of PrismJS.
- **Rejected because:** Both backends are supported by `react-syntax-highlighter`. PrismJS is
  chosen for its modular grammar architecture (smaller bundle for single-language use) and superior
  YAML 1.2 support. The backend can be switched without API changes if this proves incorrect.

### Alternative C: No syntax highlighting library — plain `<pre><code>` block

- **Description:** Display the YAML output in a `<pre><code>` block with no syntax highlighting.
- **Rejected because:** The specification explicitly requires syntax highlighting in the YAML Preview
  (`SPEC.md`, §Technische Basis: "Syntax‑Highlighting"). A plain text display does not satisfy
  the specification.

### Alternative D: CodeMirror or Monaco Editor

- **Description:** Use a full code editor (CodeMirror 6 or Monaco) for the YAML Preview.
- **Rejected because:** The YAML Preview is a read-only display panel, not an editable code
  editor. A full code editor adds significant bundle size (Monaco: ~2 MB; CodeMirror 6: ~300 KB)
  for features (editing, autocomplete, multi-cursor) that are not needed in a read-only view.
  The YAML editor escape hatches (ADR-001) use the MUI Dialog with a `<textarea>` or a lightweight
  editor; they do not require the full Monaco/CodeMirror feature set either.

---

## References

- `SPEC.md`, §Technische Basis — "Syntax‑Highlighting: PrismJS oder Highlight.js"
- `SPEC.md`, §YAML‑Preview — live-updating, syntax-highlighted YAML preview panel
- `architecture/questions/resolved-questions.md`, Q-3
- [react-syntax-highlighter on npm](https://www.npmjs.com/package/react-syntax-highlighter)
- [PrismJS documentation](https://prismjs.com)
