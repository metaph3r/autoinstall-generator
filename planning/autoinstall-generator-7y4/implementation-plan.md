# Implementation Plan: autoinstall-generator-7y4
# Form Sections: Configuration Tab

**Epic:** autoinstall-generator-7y4
**Priority:** P2
**Status:** Open
**Generated:** 2026-04-02

---

## Context

### Problem Statement

The application shell, state management, navigation, and YAML preview are in place
(epics -jah, -pqx, -dez). The Configuration tab in `FormContent.tsx` currently renders
7 placeholder accordion sections: "fields coming soon." Until real form components exist,
users cannot configure timezone, updates behaviour, shutdown type, reporting handlers,
user-data, debconf selections, or zdevs.

All action types (`SET_TIMEZONE`, `SET_UPDATES`, `SET_SHUTDOWN`, `SET_REPORTING`,
`SET_USER_DATA`, `SET_DEBCONF_SELECTIONS`, `SET_ZDEVS`) and their TypeScript types
(`ReportingHandler`, `UserDataConfig`, `ZDevConfig`) are already defined in
`AutoinstallConfigContext.tsx`. The serializer (`yamlSerializer.ts`) already handles
all seven fields. The task is to build the form components, wire them into
`FormContent.tsx`, and pass the a11y gate.

### Desired Outcome

After this epic:
- All 7 Configuration-tab sections have functional form components.
- Every field change dispatches to the global reducer; the YAML preview updates live.
- `ReportingForm` allows adding/removing named handlers with dynamic extra-field pairs.
- `UserDataForm` renders structured cloud-init `users` module fields (no YAML textarea).
- `ZDevsForm` renders an add/remove row table with `{id, enabled}` columns.
- Zero axe-core critical violations for all new components.

### Arc42 References

| Reference | Relevance |
|-----------|-----------|
| §05 Building Block View — Tab Group Contents | Canonical list of Configuration sections and their UI types |
| §05 Building Block View — Data Model | `ReportingConfig`, `UserDataConfig`, `ZDevConfig` type definitions |
| §08 Crosscutting Concepts — Form Handling | React Hook Form + Zod per-section pattern with `onChange` dispatch |
| §08 Crosscutting Concepts — State Management | `useAutoinstallConfig()` hook; action type naming convention |
| §08 Crosscutting Concepts — Validation | Zod inline errors via MUI `error` and `helperText` props |
| §08 Crosscutting Concepts — Accessibility | `jest-axe` CI gate; `aria-live` for dynamic lists |
| ADR-001 | `UserDataConfig` is typed (cloud-init `users` module); NOT a free-form YAML editor |
| ADR-004 | MUI Accordion for per-section expand/collapse |
| ADR-005 | React Hook Form (uncontrolled), Zod, MUI 6, Context+Reducer |

---

## Scope

### In Scope (Acceptance Criteria)

1. `timezone` field accepts valid tz database strings (TextField with string validation)
2. `updates` Select renders `security` / `all` options and dispatches correctly
3. `shutdown` Select renders `reboot` / `poweroff` options and dispatches correctly
4. `reporting` supports adding multiple named handlers dynamically; each handler has
   a `type` field plus arbitrary extra key-value pairs
5. `user-data` renders structured fields (name, gecos, passwd, groups, shell, lock_passwd)
   — not a YAML textarea; dispatches to `SET_USER_DATA`
6. `debconf-selections` multiline TextField dispatches to `SET_DEBCONF_SELECTIONS`
7. `zdevs` table supports add/remove rows; each row has `{id: string, enabled: boolean}`
8. Zero axe-core critical violations for all new components

### Out of Scope

- `locale` and `keyboard` form sections — they appear in `FormContent.tsx`'s
  Configuration list as placeholders and will be addressed in a separate epic
- `reporting` handler-type-specific fields beyond `type` + generic key-value extra
  pairs (e.g., dedicated endpoint URL validation for webhook type) — deferred to v2
- Timezone Select with a full IANA tz database list — deferred to v2; TextField is
  sufficient for v1 sysadmin audience
- Import / parsing of existing YAML into form fields — separate epic
- Required-field gate before export — separate quality/a11y epic (-vw6)

---

## Architecture Constraints

| Constraint | Specification | Source |
|-----------|---------------|--------|
| React Hook Form + Zod per section | Each form registers fields with RHF; Zod resolver validates; dispatch on `onChange` watch | §08 Form Handling |
| `useAutoinstallConfig()` hook only | No direct `useContext` in components; always via the hook | §08 State Management |
| MUI 6 form components | TextField, Select, Switch, FormControl, Table, IconButton — no custom-built primitives | ADR-005 |
| `SectionAccordion` wrapper | Each section is wrapped in the existing `SectionAccordion` component in `FormContent` | §05 Level 2 / ADR-004 |
| Dispatch on valid partial state | `watch()` with `useEffect` syncing valid form state to global reducer; no submit button | §08 Form Handling |
| `aria-live="polite"` for dynamic lists | Any component that mutates a list (Reporting handlers, ZDevs rows) must announce changes | §08 Accessibility |
| Zero axe-core violations gate | Each new component has an `axe` test; `jest-axe` with `toHaveNoViolations()` | ADR-002, §08 Accessibility |
| No new dependencies | All required packages (RHF, Zod, MUI, `@hookform/resolvers`) already installed | ADR-005 |

---

## Key Design Decisions

### Decision 1: TimezoneForm — TextField vs. Select with Full IANA List

**Decision:** Use a plain MUI `TextField` (string input) for `timezone`.

**Rationale:** The IANA timezone database has ~600 entries. Shipping a full Select would
require either a large static array or a third-party package. The target audience (sysadmins)
know their timezone string (e.g., `Europe/Berlin`). A TextField with Zod `z.string()` (no
format enforcement in v1) is consistent with how the Autoinstall spec treats the field — it's
a plain string. A future v2 can replace TextField with an autocomplete Select without breaking
the reducer interface.

**Tradeoff:** Sysadmins must know the exact IANA string; there is no guidance or autocomplete.
Misspelled timezones produce invalid YAML that the installer will reject at runtime. Acceptable
for v1 given the expert audience.

---

### Decision 2: ReportingForm — Dynamic Handler Map with Key-Value Extra Fields

**Decision:** Render each reporting handler as an accordion-like card with:
  - A `name` field (the map key, e.g., `my-hook`)
  - A `type` TextField (required per JSON schema)
  - A dynamic key-value table for extra fields (each row: string key + string value)
  - An "Add handler" button and a remove (×) button per handler

**Rationale:** The `reporting` section is a `Record<string, ReportingHandler>` where
`ReportingHandler = { type: string; [key: string]: unknown }`. Handler-specific fields
(e.g., `endpoint` for webhook) are open-ended per the spec. A generic key-value table
supports all handler types without hard-coding. Pure free-form YAML text would contradict
ADR-001's principle of preferring structured forms.

Extra field values are stored as strings in the key-value table; they are dispatched as
`Record<string, string>` merged with `{ type }`. This is sufficient for the common webhook
case (`endpoint: https://...`).

**Tradeoff:** Integer or boolean extra-field values (if any handler type requires them) will
be strings in the YAML output, which may cause installer validation errors. Acceptable for
v1; a future enhancement could add type hints per handler type.

---

### Decision 3: ZDevsForm — In-Table Editing

**Decision:** Render each zdev entry as a table row with an inline `TextField` for `id`
and an inline `Switch` (or `Checkbox`) for `enabled`. Provide "Add row" and "Remove"
buttons.

**Rationale:** The pattern matches the `snaps` table described in §05 (Table: rows of
`{name, channel, classic}`). MUI `Table` with `TableRow` per entry is accessible via
semantic HTML. Local state holds the current row list; the full array is dispatched on
every change via `SET_ZDEVS`.

---

### Decision 4: UserDataForm — Flat Structured Form (No Sub-Object Nesting)

**Decision:** Render the six `UserDataConfig` fields (`name`, `gecos`, `passwd`, `groups`,
`shell`, `lock_passwd`) as flat MUI form controls. `lock_passwd` is rendered as a `Switch`.
`groups` is a plain TextField (comma-separated, or blank) stored as a string.

**Rationale:** ADR-001 explicitly replaces the earlier `any` type with typed `UserDataConfig`.
The six fields of the cloud-init `users` module are well-known and fixed. A flat form is
simpler to implement, test, and use than a YAML textarea. The `groups` field in cloud-init
accepts a comma-separated string, so storing it as `string` in the type and serializing
verbatim is correct.

**Tradeoff:** Only a single user entry is supported (not an array of users). The
`user-data` section could theoretically describe multiple users. For v1, one user is
sufficient; multi-user support is deferred.

---

### Decision 5: FormContent Wiring — Targeted Component Replacement

**Decision:** Modify `FormContent.tsx` to import and render the 7 new Configuration-tab
form components in place of their placeholders. The `TAB_SECTIONS` Record and `TabPanel`
rendering logic remain unchanged. The change is surgical: pass `<TimezoneForm />` as the
child of `<SectionAccordion title="Timezone">`, etc.

**Rationale:** `FormContent.tsx` already has the `TabPanel` + `SectionAccordion`
scaffolding. Keeping that structure avoids merge conflicts with other tabs being
implemented in parallel epics. Only the Configuration tab's section children are changed.

---

## Project Structure

```
src/
  components/
    FormContent.tsx                    MODIFIED  (wire in Configuration tab components)
    TimezoneForm.tsx                   NEW
    TimezoneForm.test.tsx              NEW
    UpdatesForm.tsx                    NEW
    UpdatesForm.test.tsx               NEW
    ShutdownForm.tsx                   NEW
    ShutdownForm.test.tsx              NEW
    ReportingForm.tsx                  NEW
    ReportingForm.test.tsx             NEW
    UserDataForm.tsx                   NEW
    UserDataForm.test.tsx              NEW
    DebconfSelectionsForm.tsx          NEW
    DebconfSelectionsForm.test.tsx     NEW
    ZDevsForm.tsx                      NEW
    ZDevsForm.test.tsx                 NEW
    SectionAccordion.tsx               EXISTING (no changes)
    YamlEditorDialog.tsx               EXISTING (no changes)
  context/
    AutoinstallConfigContext.tsx       EXISTING (no changes — all types/actions already defined)
  utils/
    yamlSerializer.ts                  EXISTING (no changes — already handles all 7 sections)
```

### Module Dependency Graph

```
FormContent.tsx
  ├── TimezoneForm.tsx
  │     └── AutoinstallConfigContext (useAutoinstallConfig)
  ├── UpdatesForm.tsx
  │     └── AutoinstallConfigContext
  ├── ShutdownForm.tsx
  │     └── AutoinstallConfigContext
  ├── ReportingForm.tsx
  │     └── AutoinstallConfigContext
  ├── UserDataForm.tsx
  │     └── AutoinstallConfigContext
  ├── DebconfSelectionsForm.tsx
  │     └── AutoinstallConfigContext
  └── ZDevsForm.tsx
        └── AutoinstallConfigContext
```

All 7 form components are leaves with no mutual dependencies. They can be developed and
tested in parallel.

---

## Module Specifications

### TimezoneForm

**Purpose:** Let the user enter a timezone string from the IANA database (e.g.,
`Europe/Berlin`, `UTC`). Dispatches `SET_TIMEZONE`.

**Public API:**
```typescript
// No props — reads/writes via useAutoinstallConfig()
export function TimezoneForm(): JSX.Element
```

**Key design points:**
- `useForm` with `mode: 'onChange'`, Zod schema: `z.object({ timezone: z.string().optional() })`
- Single MUI `TextField` labelled "Timezone", `helperText` shows validation error
- `watch('timezone')` + `useEffect` dispatches on each change; dispatches `undefined`
  when field is empty to omit the key from YAML
- `defaultValues` seeded from `state.timezone` on mount

**Dependencies:** `react-hook-form`, `zod`, `@hookform/resolvers/zod`, `@mui/material/TextField`,
`useAutoinstallConfig`

**Expected tests:** ~5 unit tests

---

### UpdatesForm

**Purpose:** Select the updates strategy. Dispatches `SET_UPDATES`.

**Public API:**
```typescript
export function UpdatesForm(): JSX.Element
```

**Key design points:**
- `FormControl` + `InputLabel` + MUI `Select` with two `MenuItem`s: `security`, `all`
- Also provide a "No preference" item that dispatches `undefined` to clear the field
- Zod schema: `z.object({ updates: z.enum(['security', 'all']).optional() })`
- `defaultValues` from `state.updates`

**Expected tests:** ~5 unit tests

---

### ShutdownForm

**Purpose:** Select the shutdown behaviour. Dispatches `SET_SHUTDOWN`.

**Public API:**
```typescript
export function ShutdownForm(): JSX.Element
```

**Key design points:**
- Same pattern as `UpdatesForm`: `FormControl` + `Select` with `reboot` / `poweroff` +
  "No preference" clear option
- Zod schema: `z.object({ shutdown: z.enum(['reboot', 'poweroff']).optional() })`
- `defaultValues` from `state.shutdown`

**Expected tests:** ~5 unit tests

---

### ReportingForm

**Purpose:** Manage the `reporting` map — a dictionary of named event handlers. Each
handler has a `type` (required) and arbitrary extra string key-value fields. Dispatches
`SET_REPORTING`.

**Public API:**
```typescript
export function ReportingForm(): JSX.Element
```

**Key design points:**
- Local component state holds the handler list (not React Hook Form — dynamic structure
  makes RHF less natural here):
  ```typescript
  interface HandlerEntry {
    name: string        // map key
    type: string
    extras: Array<{ key: string; value: string }>
  }
  const [handlers, setHandlers] = useState<HandlerEntry[]>([])
  ```
- On every `handlers` change, convert to `Record<string, ReportingHandler>` and dispatch:
  ```typescript
  useEffect(() => {
    if (handlers.length === 0) {
      dispatch({ type: 'SET_REPORTING', payload: undefined })
      return
    }
    const reporting: Record<string, ReportingHandler> = {}
    for (const h of handlers) {
      const extra = Object.fromEntries(h.extras.map(e => [e.key, e.value]))
      reporting[h.name] = { type: h.type, ...extra }
    }
    dispatch({ type: 'SET_REPORTING', payload: reporting })
  }, [handlers, dispatch])
  ```
- Each handler renders as a `Box` section with:
  - TextField for `name` (handler map key)
  - TextField for `type` (required; shows error if blank)
  - A mini table with rows of `{key, value}` TextFields + "Add field" / remove row buttons
  - A remove-handler (×) IconButton
- "Add handler" Button appends a new blank entry to `handlers`
- `aria-live="polite"` region announces "Handler added" / "Handler removed"
- `defaultValues` seeded from `state.reporting` on mount by converting the Record back
  into `HandlerEntry[]`

**Dependencies:** `useState`, `useEffect`, MUI TextField/Button/IconButton/Table,
`useAutoinstallConfig`

**Expected tests:** ~9 unit tests (render, add handler, remove handler, dispatch,
extras add/remove, axe)

---

### UserDataForm

**Purpose:** Structured cloud-init `users` module form. Dispatches `SET_USER_DATA`.

**Public API:**
```typescript
export function UserDataForm(): JSX.Element
```

**Key design points:**
- RHF + Zod with the `UserDataConfig` schema:
  ```typescript
  const schema = z.object({
    name:        z.string().optional(),
    gecos:       z.string().optional(),
    passwd:      z.string().optional(),
    groups:      z.string().optional(),
    shell:       z.string().optional(),
    lock_passwd: z.boolean().optional(),
  })
  ```
- Five `TextField` fields + one `Switch` (lock_passwd, labelled "Lock password")
- Helper text on each field explaining the cloud-init meaning (e.g., gecos: "Full name / comment")
- `watch()` + `useEffect` dispatches on change; dispatches `undefined` when all fields
  are blank/undefined
- `defaultValues` from `state['user-data']`

**Expected tests:** ~7 unit tests

---

### DebconfSelectionsForm

**Purpose:** Freeform multiline TextField for `debconf-selections`. Dispatches
`SET_DEBCONF_SELECTIONS`.

**Public API:**
```typescript
export function DebconfSelectionsForm(): JSX.Element
```

**Key design points:**
- Single multiline MUI `TextField` with `minRows={4}`, labelled "Debconf selections"
- No Zod schema required (any string is valid); use plain `useState` + `onChange` dispatch
- Dispatches `undefined` when field is empty to omit from YAML
- `data-testid="debconf-selections-field"` on the TextField

**Expected tests:** ~4 unit tests (render, input dispatches, empty clears, axe)

---

### ZDevsForm

**Purpose:** Manage the `zdevs` list — rows of `{id: string, enabled: boolean}`.
Dispatches `SET_ZDEVS`.

**Public API:**
```typescript
export function ZDevsForm(): JSX.Element
```

**Key design points:**
- Local state: `const [rows, setRows] = useState<ZDevConfig[]>([])`
- `useEffect` dispatches on every `rows` change:
  ```typescript
  useEffect(() => {
    dispatch({ type: 'SET_ZDEVS', payload: rows.length ? rows : undefined })
  }, [rows, dispatch])
  ```
- MUI `Table` with columns: ID | Enabled | Actions
  - `id` column: inline `TextField` (editable in place)
  - `enabled` column: `Switch` or `Checkbox`
  - Actions column: remove IconButton (×)
- "Add device" Button appends `{ id: '', enabled: false }` to `rows`
- `aria-live="polite"` region announces "Device added" / "Device removed"
- `data-testid` attributes: `"zdevs-table"`, `"zdevs-add-button"`, `"zdevs-row-{index}"`
- `defaultValues` seeded from `state.zdevs` on mount

**Dependencies:** `useState`, `useEffect`, MUI Table/TextField/Switch/IconButton/Button,
`useAutoinstallConfig`

**Expected tests:** ~7 unit tests (render, add row, remove row, id change dispatches,
enabled toggle dispatches, empty dispatches undefined, axe)

---

### FormContent (modification)

**Change:** In the `Configuration` tab panel, replace placeholder children with the
7 real form components. The `TAB_SECTIONS` constant and the multi-section accordion
map remain the same in structure; only children passed to `SectionAccordion` change.

**Sketch of updated Configuration panel:**
```tsx
// Inside the Configuration TabPanel:
<SectionAccordion title="Timezone">
  <TimezoneForm />
</SectionAccordion>
<SectionAccordion title="Updates">
  <UpdatesForm />
</SectionAccordion>
<SectionAccordion title="Shutdown">
  <ShutdownForm />
</SectionAccordion>
<SectionAccordion title="Reporting">
  <ReportingForm />
</SectionAccordion>
<SectionAccordion title="User Data">
  <UserDataForm />
</SectionAccordion>
<SectionAccordion title="Debconf Selections">
  <DebconfSelectionsForm />
</SectionAccordion>
<SectionAccordion title="Z Devices">
  <ZDevsForm />
</SectionAccordion>
```

`FormContent.tsx` currently uses a `TAB_SECTIONS` Record to drive accordion rendering
generically. The implementation should replace the generic placeholder rendering for the
`Configuration` tab with a bespoke branch that renders the actual components, following
the pattern established for other complex tabs (or simply special-case the Configuration
group index, similar to how Storage's single-section group is currently handled).

---

## Test Strategy

### Coverage Target

**≥ 90% aggregate line coverage** for all new source files.

### Test Counts per Module

| Module | Unit tests | Integration | Total |
|--------|-----------|-------------|-------|
| `TimezoneForm` | 5 | — | 5 |
| `UpdatesForm` | 5 | — | 5 |
| `ShutdownForm` | 5 | — | 5 |
| `ReportingForm` | 9 | — | 9 |
| `UserDataForm` | 7 | — | 7 |
| `DebconfSelectionsForm` | 4 | — | 4 |
| `ZDevsForm` | 7 | — | 7 |
| `FormContent` (updated) | 2 new tests | — | 2 |
| **Total** | | | **~44** |

### Test Patterns

All tests follow the `YamlEditorDialog.test.tsx` pattern:

```typescript
// Render helper — every test wraps with AutoinstallConfigProvider
function renderForm() {
  return render(
    <AutoinstallConfigProvider>
      <ComponentUnderTest />
    </AutoinstallConfigProvider>
  )
}

// axe test — required for every component
it('has no axe-core critical violations', async () => {
  const { container } = renderForm()
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

**Dispatch verification:** Use a custom `renderWithSpy` helper that wraps
`AutoinstallConfigProvider` and captures dispatched actions to verify the reducer
is called with the expected action type and payload:

```typescript
// Pattern for verifying dispatch
function renderWithDispatchSpy(component: ReactNode) {
  const dispatched: AutoinstallAction[] = []
  // Wrap provider, intercept dispatch via a custom context override in test
  // OR read the rendered YAML state indirectly via yamlSerializer
}
```

Since direct dispatch spying requires context mocking, the simpler approach is to
assert on the context's `state` after interaction by rendering a thin
`StateReadout` child that exposes `state` values:

```typescript
function renderFormWithStateReadout(FormComponent: React.ComponentType) {
  let capturedState: AutoinstallConfig | null = null
  function Readout() {
    const { state } = useAutoinstallConfig()
    capturedState = state
    return null
  }
  render(
    <AutoinstallConfigProvider>
      <FormComponent />
      <Readout />
    </AutoinstallConfigProvider>
  )
  return { getState: () => capturedState }
}
```

### Fixture Table

| Component | Key fixture inputs | Verified assertions |
|-----------|-------------------|---------------------|
| TimezoneForm | `'Europe/Berlin'` string typed | `state.timezone === 'Europe/Berlin'` |
| UpdatesForm | Select `'security'` | `state.updates === 'security'` |
| ShutdownForm | Select `'poweroff'` | `state.shutdown === 'poweroff'` |
| ReportingForm | Add handler `name='hook'`, `type='webhook'` | `state.reporting['hook'].type === 'webhook'` |
| ReportingForm | Remove handler | `state.reporting` is `undefined` |
| UserDataForm | Enter `name='ubuntu'`, toggle `lock_passwd` | `state['user-data'].name === 'ubuntu'`, `lock_passwd === true` |
| DebconfSelectionsForm | Multiline text entered | `state['debconf-selections']` contains the text |
| ZDevsForm | Add row, set `id='0.0.1000'`, toggle enabled | `state.zdevs[0].id === '0.0.1000'` |
| ZDevsForm | Remove row | `state.zdevs` is `undefined` |

### Acceptance Criteria → Test Mapping

| Acceptance Criterion | Verifying Tests |
|---------------------|----------------|
| timezone field accepts valid tz database strings | `TimezoneForm`: "accepts string input and dispatches SET_TIMEZONE" |
| updates Select dispatches correctly | `UpdatesForm`: "selects security option", "selects all option" |
| shutdown Select dispatches correctly | `ShutdownForm`: "selects reboot option", "selects poweroff option" |
| reporting supports multiple named handlers | `ReportingForm`: "add handler button adds entry", "renders multiple handlers" |
| user-data renders structured fields | `UserDataForm`: "renders name/gecos/passwd/groups/shell fields", "renders lock_passwd switch" |
| debconf-selections multiline TextField | `DebconfSelectionsForm`: "renders multiline field", "input dispatches" |
| zdevs table add/remove rows | `ZDevsForm`: "add-button adds row", "remove button removes row" |
| Zero axe-core critical violations | Every component: "has no axe-core critical violations" |

### Quality Gates

- `npm run test` passes with zero failures
- Coverage report (Istanbul via Vitest) shows ≥ 90% for all new files
- `npm run type-check` (`tsc --noEmit`) passes with zero errors
- `npm run lint` passes with zero errors

---

## Forward Compatibility

| Downstream Epic | Readiness | Integration Point |
|----------------|-----------|------------------|
| autoinstall-generator-vw6 (Testing, A11y & Quality Gates) | Ready: all new components have axe tests; no API changes needed | axe tests pattern; required-field gate in FormContent |
| Future v2: Timezone autocomplete | Ready: TimezoneForm renders a standalone `TextField`; replace with MUI `Autocomplete` without reducer changes | `SET_TIMEZONE` dispatch; `state.timezone` string type |
| Future v2: Multi-user UserData | Ready: `SET_USER_DATA` accepts `UserDataConfig`; extending to array would require a new action type | Context `UserDataConfig` type; `yamlSerializer.ts` |
| Future: Import/parse YAML into form | Ready: all forms read `defaultValues` from `state.*` on mount; seeding from imported state will work transparently | `defaultValues` pattern in all RHF forms |

---

## Dependency Changes

None. All required packages are already installed:
- `react-hook-form` — already in `package.json`
- `@hookform/resolvers` — already in `package.json`
- `zod` — already in `package.json`
- `@mui/material` — already in `package.json`
- `@mui/icons-material` — already in `package.json` (for remove/add IconButtons)

---

## Verification

| Epic Acceptance Criterion | Evidence |
|--------------------------|---------|
| timezone field accepts valid tz database strings | `TimezoneForm.test.tsx`: "accepts string input and dispatches"; `FormContent` shows `TimezoneForm` in Configuration tab |
| reporting supports multiple named handlers | `ReportingForm.test.tsx`: "add handler button adds second entry"; "dispatches SET_REPORTING with correct handler map" |
| user-data renders structured fields (not a YAML textarea) | `UserDataForm.test.tsx`: "renders TextField for name"; "renders Switch for lock_passwd"; no `data-testid="yaml-editor-textarea"` present |
| zdevs table supports add/remove rows | `ZDevsForm.test.tsx`: "zdevs-add-button adds a row"; "remove button decrements row count" |
| Zero axe-core critical violations | Each `*.test.tsx`: "has no axe-core critical violations" using `jest-axe` |

---

## Key References

| Document | Path | Relevance |
|---------|------|-----------|
| §05 Building Block View | `docs/arc42/05-building-block-view.md` | Tab group contents, component responsibilities |
| §08 Crosscutting Concepts | `docs/arc42/08-crosscutting-concepts.md` | Form handling, state, a11y, validation patterns |
| §09 Architecture Decisions | `docs/arc42/09-architecture-decisions.md` | ADR-001 (typed UserDataConfig), ADR-005 (tech stack) |
| AutoinstallConfigContext | `src/context/AutoinstallConfigContext.tsx` | All types, actions, and reducer already implemented |
| yamlSerializer | `src/utils/yamlSerializer.ts` | Serialization for all 7 sections already implemented |
| FormContent | `src/components/FormContent.tsx` | File to modify; wraps sections in TabPanel + SectionAccordion |
| YamlEditorDialog (test) | `src/components/YamlEditorDialog.test.tsx` | Reference test pattern for all new test files |
| SPEC.md | `SPEC.md` | Canonical field definitions and UI component types |
