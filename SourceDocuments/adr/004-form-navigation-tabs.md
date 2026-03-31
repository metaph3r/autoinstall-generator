# ADR-004: Form Navigation — Grouped MUI Tabs

**Status:** Proposed
**Date:** 2026-03-31
**Triggered by:** Q-4 (resolved-questions.md)

---

## Context

The application specification (`SPEC.md`, §Formular‑Editor) describes the form editor as a
"Mehrseitiges Formular (Tabs oder Stepper)" — a multi-page form using either Tabs or a Stepper,
without deciding between the two.

The form covers **26 Autoinstall sections** (as enumerated in `SPEC.md`, §Formularstruktur). This
scale makes the choice of navigation pattern architecturally significant:

- 26 sections in a linear Stepper would require 26 sequential "Next" button clicks to traverse
  the entire form. The Stepper component is optimized for **wizard flows** where a novice user is
  guided through a process in a defined sequence, with each step building on the previous.
- The target audience is explicitly **"sysadmins, DevOps engineers"** (`SPEC.md`, §Ziel der
  Anwendung) — expert users who already know Ubuntu's Autoinstall schema and who configure only
  the sections relevant to their specific deployment. An expert sysadmin configuring network
  interfaces does not want to navigate through "Locale" and "Keyboard" to reach "Network."

A flat tab structure with 26 tabs is not usable (26 items overflow any reasonable tab bar). The
sections must be **grouped** into logical categories. A two-level navigation hierarchy (tab group →
individual section) is the natural solution.

**Proposed tab groups** (6 groups, covering all 26 sections):

| Tab Group | Sections |
|-----------|---------|
| System | version, interactive-sections, refresh-installer, early-commands, late-commands, error-commands |
| Network | network (Netplan, YAML editor escape hatch), proxy |
| Storage | storage (Layout mode + Action mode YAML editor escape hatch) |
| Identity & Auth | identity, active-directory, ubuntu-pro, ssh |
| Software | source, apt, codecs, drivers, oem, snaps, packages, kernel, kernel-crash-dumps |
| Configuration | timezone, updates, shutdown, reporting, user-data (YAML editor escape hatch), debconf-selections, zdevs |

MUI `Accordion` components (already listed in `SPEC.md`, §Komponenten) can be used within each
tab group to expand/collapse individual sections, providing a natural two-level navigation
hierarchy without additional navigation components.

**MUI Tabs** supports both horizontal orientation (standard tab bar) and vertical orientation.
Vertical tabs are particularly effective for dense configuration UIs where the section list is
longer than the horizontal space allows.

---

## Decision

Use **MUI `Tabs`** as the primary form navigation component, with sections organized into
**6 logical tab groups** as listed above.

Within each tab group, individual sections may be presented using **MUI `Accordion`** components
to allow collapse/expand of individual sections without a page transition.

- Navigation between tab groups is non-sequential (the user can click any tab at any time)
- Navigation within a tab group (via Accordion expand/collapse) is also non-sequential
- No "Next"/"Previous" step buttons are provided — tabs are the sole navigation mechanism
- A guided Stepper mode for novice users is **explicitly deferred to v2**

---

## Consequences

### Positive

- Expert users (sysadmins, DevOps engineers) can navigate directly to the section they need
  without traversing irrelevant sections.
- The two-level hierarchy (6 tabs × ~4 sections per tab) is scannable and manageable.
- MUI `Tabs` + `Accordion` are both in `SPEC.md`'s component inventory — no new library
  dependencies are required.
- The §05 building block view uses MUI `Tabs` as the primary navigation component; the
  `FormNavigation` building block is concrete.
- §04 UX strategy can be documented as "expert-user tab navigation with 6 logical groups."

### Negative

- A guided wizard mode (Stepper) for first-time users or novice sysadmins is not provided in v1.
  Users who don't know the Autoinstall schema well enough to know which section they need are
  underserved in v1.
- Some Autoinstall sections have dependencies that a Stepper would make explicit (e.g., you cannot
  configure Ubuntu Pro without an identity). With Tabs, these cross-section dependencies must be
  communicated via inline validation messages rather than step ordering.
- Tab group design (which sections belong in which group) is a UX judgment call; the grouping
  proposed above may be revised during implementation based on user feedback.

### Neutral

- MUI `Tabs` can be oriented horizontally (default) or vertically; the implementation can choose
  based on the layout design.
- The 26-section count may change if sections are added, removed, or consolidated during
  implementation. The tab grouping is a logical design, not a hard architectural constraint.
- The Accordion within each tab is optional; sections with a single field (e.g., "proxy") may
  not need Accordion wrapping.

---

## Arc42 Impact

| Section | Impact |
|---------|--------|
| §04 | UX strategy: "expert-user tab navigation; 6 logical groups; non-sequential access pattern" |
| §05 | `FormNavigation` building block uses MUI `Tabs` (not `Stepper`); `SectionAccordion` component wraps individual sections within a tab group |

---

## Alternatives Considered

### Alternative A: MUI Stepper (linear wizard)

- **Description:** Use a linear Stepper with 26 steps (one per Autoinstall section), guiding
  the user through the form in a fixed sequence.
- **Rejected because:** A 26-step linear wizard is unsuitable for expert users who need to
  configure only 3–5 sections relevant to their deployment. Stepper is optimized for onboarding
  flows with a defined completion path, not for expert configuration tools with arbitrary
  access patterns.

### Alternative B: Flat Tabs (one tab per section, no grouping)

- **Description:** 26 tabs, each containing one Autoinstall section.
- **Rejected because:** 26 tabs overflow the available horizontal space on any reasonable screen
  width and are not scannable. MUI's `Tabs` component supports scrollable tab bars, but 26 tabs
  in a single scrollable list is a poor UX for quick navigation.

### Alternative C: Sidebar navigation with section list

- **Description:** A left sidebar listing all 26 sections, with the active section's form
  rendered in the main content area.
- **Rejected because:** The two-column layout (form left, YAML preview right) is specified in
  `SPEC.md` (§Layout). A sidebar navigation in the left column would conflict with this layout
  on standard desktop widths. A horizontal tab bar or vertical tabs in the left column of a
  two-column layout is the natural fit.

### Alternative D: Hybrid — Stepper for first-time users, Tabs for returning users

- **Description:** Detect first-time visit (e.g., via localStorage flag) and present a guided
  Stepper; subsequent visits use Tabs.
- **Rejected because:** This adds state management complexity and two separate navigation
  implementations for a v1 feature. The specification does not mention a wizard mode. Deferred
  to v2 as a potential enhancement.

---

## References

- `SPEC.md`, §Formular‑Editor — "Mehrseitiges Formular (Tabs oder Stepper)"
- `SPEC.md`, §Ziel der Anwendung — target audience: sysadmins, DevOps engineers
- `SPEC.md`, §Formularstruktur — 26 Autoinstall sections enumerated
- `SPEC.md`, §Komponenten — MUI `Tabs`, `Accordion` in component inventory
- `SPEC.md`, §Layout — two-column layout: form left, YAML preview right
- `architecture/questions/resolved-questions.md`, Q-4
