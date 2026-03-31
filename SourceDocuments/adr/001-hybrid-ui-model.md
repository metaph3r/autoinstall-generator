# ADR-001: Hybrid UI Model — Structured Forms with YAML Editor Escape Hatches

**Status:** Proposed
**Date:** 2026-03-31
**Triggered by:** Q-1 (resolved-questions.md)

---

## Context

The application specification (`SPEC.md`, §Ziel der Anwendung) states: "All fields of the official
Autoinstall reference are covered via UI components." This implies a fully form-based approach where
every section is rendered as structured input fields.

However, the same specification simultaneously recommends or requires a YAML editor for at least
two sections:

- **Network** (`SPEC.md`, §Network): "YAML‑Editor oder Formular" — YAML editor listed first
- **Storage Action mode** (`SPEC.md`, §Storage): "YAML‑Editor empfohlen" — explicit recommendation

The spec also lists "YAML‑Editor (cloud-init)" for User-Data, but this recommendation assumed
arbitrary cloud-init YAML. The application scopes user-data to the cloud-init `users` module, whose
fields are bounded and typed (`name`, `gecos`, `passwd`, `groups`, `shell`, `lock_passwd`). This
subset is fully representable as a structured form and does not require a YAML editor escape hatch.

These two sections cannot practically be rendered as structured forms:

- **Network**: The Netplan YAML format is a deeply nested, open-ended declarative schema that
  supports dozens of device types (ethernets, bridges, bonds, VLANs, Wi-Fi, tunnels). Reproducing
  this as a structured form would require a custom Netplan DSL editor — a project in itself.
- **Storage Action mode**: The Autoinstall JSON Schema for `storage` is typed as `"type": "object"`
  with no properties — deliberately unconstrained. Autoinstall's action list format (with `id`
  references between actions) cannot be validated via a static JSON schema or rendered as a bounded
  form without writing a full storage action DSL.

The TypeScript data model in `SPEC.md` (§Datenmodell) shows `network?: any` typed as `any` —
a deliberate signal that free-form Netplan input is expected and no bounded interface is feasible.
The initial `userData?: any` type was a placeholder; the bounded `users` module scope enables a
proper typed `UserDataConfig` interface (replacing `any`) covering the fields `name`, `gecos`,
`passwd`, `groups`, `shell`, and `lock_passwd`.

A `Dialog` component is listed in the `SPEC.md` component inventory (§Komponenten). The only
natural use case for a Dialog in this application is a YAML editor popup — no other modal
interactions are described in the spec.

This contradiction between the §01 goal statement and the section-level recommendations requires an
explicit architectural resolution before §04, §05, and §06 can be drafted.

---

## Decision

Adopt a **hybrid model**: structured forms are the primary UI for all Autoinstall sections where
the field structure is known and bounded. Embedded YAML editors (rendered inside MUI `Dialog`
components) are used as **intentional escape hatches** for exactly two sections:

1. **Network** — Netplan YAML (free-form; YAML 1.2 schema is unbounded for this use case)
2. **Storage Action mode** — Autoinstall action list YAML (unschemaed; `"type": "object"` with no
   properties in the Autoinstall JSON Schema)

The §01 goal statement is updated to read: "Most Autoinstall fields are covered via structured UI
components; Network and Storage Action mode use embedded YAML editors as intentional escape hatches
for sections that are structurally unbounded."

All other sections (approximately 24 of 26) use structured form components (MUI `TextField`,
`Select`, `Switch`, `Checkbox`, `Table`, `Accordion`, etc.) as originally envisioned. User-Data
is handled via a structured form scoped to the cloud-init `users` module.

---

## Consequences

### Positive

- Resolves the contradiction between the form-first goal and the section-level YAML editor
  recommendations in a principled, documented way.
- Allows §05 building block view to include a `YamlEditorDialog` component with a defined scope
  (exactly 2 sections).
- Justifies the `any` type in the TypeScript model for `network`.
- Enables a typed `UserDataConfig` interface for `userData` (replacing `any`), making it fully
  validatable via Zod against the bounded cloud-init `users` module schema.
- Keeps the v1 implementation feasible: structured forms for 24 sections, escape hatches for 2.
- The Dialog-based escape hatch is a natural UX pattern: the user opens the dialog, edits YAML,
  and confirms — the raw YAML string is stored in state and serialized verbatim into the output.

### Negative

- The **Network and Storage Action mode** escape-hatch fields are **opaque to the application's
  validation layer**. Zod cannot validate free-form YAML strings; only structural JSON Schema
  validation (already embedded in `SPEC.md` §JSON Schema) can catch top-level structural errors
  in these sections.
- The YAML editor must handle **merge complexity**: raw YAML strings entered via the escape hatch
  must be merged back into the `AutoinstallConfig` state object and then serialized correctly in
  the final output. This requires storing these fields as raw strings in the reducer and
  serializing them verbatim (see Q-11 risk register: "YAML editor merge complexity").
- YAML syntax errors entered by the user in the escape hatch are not caught by the form validation
  layer; a YAML parse error check at Dialog close time is the minimum viable guard.

### Neutral

- The `Dialog` component in `SPEC.md`'s component list is now accounted for with a defined purpose.
- Storage Layout mode uses a structured form with a **radio group / Select** for `layout.name`.
  The three supported values are `lvm` (default), `direct`, and `zfs` — per the official Autoinstall
  reference. The earlier spec entry "hybrid" is not an officially supported layout and is removed.
  Only Action mode uses the YAML editor escape hatch.
- The Storage section has two sub-modes; the UI must allow the user to toggle between Layout mode
  (structured form) and Action mode (YAML editor). This toggle is a design detail, not an
  architectural constraint.
- User-Data is scoped to the cloud-init `users` module. Other cloud-init modules (packages,
  runcmd, write_files, etc.) are out of scope for v1. This scope decision should be documented
  in the §01 scope boundary.

---

## Arc42 Impact

| Section | Impact |
|---------|--------|
| §01 | Goal statement narrowed: "Most fields via UI; Network and Storage Action mode use embedded YAML editors as escape hatches; User-Data scoped to cloud-init `users` module (structured form)" |
| §04 | UX strategy is "form-first with YAML editor escape hatches for structurally unbounded sections"; document as an intentional design principle |
| §05 | `YamlEditorDialog` component must appear in the building block view; 2 sections use it |
| §06 | Escape-hatch interaction flow (open dialog → edit YAML → confirm → merge into state) needs a runtime view scenario |
| §08 | State management crosscutting concept must address storing raw YAML strings in the reducer and serializing them verbatim in the YAML output |

---

## Alternatives Considered

### Alternative A: Full structured forms for all 26 sections (including Network and Storage Action)

- **Description:** Build a custom Netplan DSL form and a custom storage action list editor,
  covering the full structural complexity of these sections as structured form components.
- **Rejected because:** The Netplan YAML schema supports dozens of device types and is evolved
  independently by Canonical. Building a complete structured Netplan editor would be a
  project-sized undertaking in itself and would require ongoing maintenance as Netplan evolves.
  The Autoinstall storage action format is explicitly unschemaed; a structured editor cannot be
  derived from the schema.

### Alternative B: Scope out Network and Storage Action mode from v1; treat User-Data as a full YAML editor

- **Description:** Remove Network (defer to v2 with YAML editor) and Storage Action mode from the
  v1 feature set entirely; implement only Storage Layout mode and a plain `proxy` field for network.
  Keep User-Data as a free-form YAML editor accepting any cloud-init module.
- **Rejected because:** Network configuration is a core Autoinstall use case; omitting it from v1
  would significantly limit the tool's utility. The YAML editor escape hatch is a lower-cost
  solution than full omission. For User-Data, scoping to the `users` module provides a better UX
  (structured form with validation) than a free-form YAML editor, at the cost of deferring other
  cloud-init modules to v2.

### Alternative C: Raw YAML editor for the entire form (no structured forms)

- **Description:** Provide a full-screen YAML editor with JSON Schema validation and syntax
  highlighting for the entire `autoinstall.yaml`, with no structured form components.
- **Rejected because:** This is the antithesis of the application's stated goal: "form-based
  creation." It provides no UX improvement over a plain text editor with the Autoinstall schema
  loaded. The value proposition of this application is specifically the form-based abstraction.

---

## References

- `SPEC.md`, §Ziel der Anwendung — original "all fields via UI components" goal statement
- `SPEC.md`, §Network — "YAML‑Editor oder Formular"
- `SPEC.md`, §Storage — "YAML‑Editor empfohlen" for Action mode
- `SPEC.md`, §User-Data — "YAML‑Editor (cloud-init)" (superseded: scope narrowed to `users` module; structured form used instead)
- `SPEC.md`, §Datenmodell — `network?: any` TypeScript type; `userData?: any` to be replaced with typed `UserDataConfig`
- cloud-init `users` module — fields: `name`, `gecos`, `passwd`, `groups`, `shell`, `lock_passwd`; documented at https://cloudinit.readthedocs.io/en/latest/reference/modules.html#users-and-groups
- `SPEC.md`, §Komponenten — Dialog listed in component inventory
- `SPEC.md`, §JSON Schema — storage schema typed as `"type": "object"` with no properties
- `architecture/questions/resolved-questions.md`, Q-1
