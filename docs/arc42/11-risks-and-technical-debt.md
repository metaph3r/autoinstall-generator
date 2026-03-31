# §11 Risks and Technical Debt

**Generated:** 2026-03-31
**Sources:** `architecture/questions/resolved-questions.md` (Q-11); ADR-001, ADR-002; `SPEC.md` §Erweiterbarkeit, §Exportfunktionen, §Datenmodell

---

## 11.1 Risk Register

### R-1: Autoinstall Schema Drift

| Attribute | Value |
|-----------|-------|
| **Risk** | Canonical publishes a new version of the Autoinstall schema; the application's hardcoded TypeScript types and Zod schemas become stale or invalid |
| **Probability** | Medium — Canonical actively evolves Autoinstall; new Ubuntu LTS releases have historically introduced schema changes |
| **Impact** | High — stale schemas cause the application to generate invalid `autoinstall.yaml` files, silently producing broken output for real installations |
| **Trigger** | Canonical releases a new Ubuntu LTS version with Autoinstall schema changes |

**Mitigation:**

1. **Monitor** Canonical's [Autoinstall changelog](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html) and GitHub repository for schema updates
2. **Consider** generating TypeScript types from the official Autoinstall JSON Schema at build time using `json-schema-to-typescript`, so the types are always in sync with the embedded schema without manual maintenance
3. **Test** the embedded JSON Schema version in CI: validate known-good YAML fixtures against the embedded schema in the test suite

(Source: Q-11, resolved; SPEC.md §JSON Schema)

---

### R-2: Scope Creep from "Optional" Features

| Attribute | Value |
|-----------|-------|
| **Risk** | The features explicitly listed as optional in `SPEC.md` §Erweiterbarkeit (i18n, YAML import, dark mode) and §Exportfunktionen (QR code) are implemented in v1, increasing scope and delaying delivery |
| **Probability** | Medium — "optional" features often get prioritized during development once the core is working |
| **Impact** | Medium — delayed delivery; increased complexity; higher maintenance burden without clear user demand |
| **Trigger** | Development decision to implement optional features before v1 is complete and tested |

**Mitigation:**

1. **Explicitly defer** all §Erweiterbarkeit items to v2: no i18n, no YAML import, no QR code, no dark mode, no wizard Stepper mode in v1. This is already documented in [§01](01-introduction-and-goals.md#scope-v1) and [§04](04-solution-strategy.md).
2. **Use GitHub Issues** to track deferred features as future enhancement requests, not current tasks.
3. **Define v1 acceptance criteria** as: all 26 Autoinstall sections accessible via the structured UI (or escape hatch), live YAML preview functional, Copy + Download export working, zero critical axe violations in CI.

(Source: Q-11, resolved; SPEC.md §Erweiterbarkeit)

---

### R-3: YAML Editor Escape Hatch Merge Complexity

| Attribute | Value |
|-----------|-------|
| **Risk** | Raw YAML strings entered via the Network and Storage Action mode escape hatches must be correctly merged into the `AutoinstallConfig` state and then serialized correctly in the final YAML output; errors in this merge produce silently malformed output |
| **Probability** | High — this code path will be exercised by any user who configures networking or complex storage |
| **Impact** | Medium — malformed output could cause silent installation failures; however, the YAML parse check at Dialog close time reduces the blast radius to syntax-valid-but-semantically-invalid YAML |
| **Trigger** | Implementation of the `YamlEditorDialog` confirm handler and the reducer's `SET_NETWORK` / `SET_STORAGE_ACTIONS` action handlers |

**Mitigation:**

1. **Store raw strings verbatim** in the reducer (`AutoinstallConfig.network?: any`) — already reflected in the TypeScript model. Do not attempt to re-parse and re-serialize the raw string during YAML output generation.
2. **Parse check at Dialog close**: `yaml.parse(editedYaml)` before dispatching — prevents syntax-invalid YAML from entering the state.
3. **Test suite**: Include test cases for escape-hatch round-trip scenarios — enter YAML → confirm → generate output → verify the raw YAML appears verbatim in the output `network:` or `storage:` section.
4. **Consider** rendering a `<pre>` preview of the escape-hatch YAML within the Dialog, so users can visually verify their input before confirming.

(Source: Q-11, resolved; ADR-001 §Negative consequences)

---

### R-4: Clipboard API Unavailability in Non-HTTPS Contexts

| Attribute | Value |
|-----------|-------|
| **Risk** | `navigator.clipboard.writeText()` is only available in secure contexts (HTTPS or localhost). If the application is served over HTTP (e.g., a self-hosted deployment without TLS), the Copy to clipboard feature silently fails |
| **Probability** | Low — GitHub Pages enforces HTTPS; `localhost` is treated as a secure context by all evergreen browsers. Only affects non-standard deployments |
| **Impact** | Low — the user can still download the YAML file; the Copy function is a convenience feature |
| **Trigger** | A user self-hosts the application over HTTP (e.g., `http://192.168.1.x/`) |

**Mitigation:**

1. **Graceful fallback**: If `navigator.clipboard` is undefined or `writeText()` rejects, display a `<textarea>` containing the YAML string with a message: "Auto-copy requires HTTPS. Copy manually from the text area below."
2. **No blocking required**: This is a low-impact UX degradation, not a functional failure.

(Source: Q-11, resolved; SPEC.md §Exportfunktionen)

---

## 11.2 Technical Debt Register

### TD-1: `network?: any` TypeScript Type

| Attribute | Value |
|-----------|-------|
| **Item** | The `AutoinstallConfig.network` field is typed as `any` in the TypeScript model |
| **Why it exists** | The Netplan YAML schema is open-ended; the escape hatch stores a raw YAML string as `any`. This is intentional in v1. |
| **Cost of keeping it** | Loss of type safety for the `network` field; TypeScript cannot detect structural errors in the Netplan payload |
| **Path to resolution** | If a partial Netplan type (covering the common device types: `ethernets`, `wifis`, `bridges`) is added in v2, the type could be narrowed to `NetplanConfig | string` to at least distinguish between a structured and a raw-string state |

(Source: SPEC.md §Datenmodell; ADR-001)

---

### TD-2: No PR Preview Deployments

| Attribute | Value |
|-----------|-------|
| **Item** | GitHub Pages does not support PR preview deployments. Pull requests can only be reviewed locally or by checking out the branch. |
| **Why it exists** | Chosen hosting platform (GitHub Pages) does not natively support preview deployments (ADR-002) |
| **Cost of keeping it** | Slower review cycles for UI changes; reviewers must run the app locally to test PR changes |
| **Path to resolution** | Add Netlify or Vercel as a PR preview platform in parallel with GitHub Pages production deployment (ADR-002 §Alternatives — Alternative C notes this) |

(Source: ADR-002 §Negative consequences)

---

### TD-3: `version: 1` Hardcoded Schema Version

| Attribute | Value |
|-----------|-------|
| **Item** | The Autoinstall JSON Schema constrains `version` to `minimum: 1, maximum: 1`. This is hardcoded as a constant in the form and embedded schema. |
| **Why it exists** | There is currently only one Autoinstall schema version. The constraint is correct today. |
| **Cost of keeping it** | If Canonical introduces `version: 2`, the application must be manually updated to support it; the schema constraint (`maximum: 1`) will reject `version: 2` documents |
| **Path to resolution** | When Canonical releases a schema version 2, update the embedded JSON Schema and the `version` field's Zod validation to permit the new version. Consider fetching the schema at build time from Canonical's published source instead of embedding a static copy (this is also Risk R-1's mitigation path). |

(Source: SPEC.md §JSON Schema — `"minimum": 1, "maximum": 1`; R-1 mitigation)

---

## Cross-References

- Scope (v1 exclusions to prevent scope creep): [§01 Introduction and Goals — Scope](01-introduction-and-goals.md#scope-v1)
- Escape hatch design (R-3): [§09 Architecture Decisions — ADR-001](09-architecture-decisions.md#adr-001-hybrid-ui-model), [§05 Building Block View — YamlEditorDialog](05-building-block-view.md)
- Clipboard API scenario (R-4): [§06 Runtime View — Scenario 4](06-runtime-view.md#scenario-4-copy-to-clipboard)
- Deployment limitations (TD-2): [§07 Deployment View](07-deployment-view.md)
- Quality requirements threatened by these risks: [§10 Quality Requirements](10-quality-requirements.md)
