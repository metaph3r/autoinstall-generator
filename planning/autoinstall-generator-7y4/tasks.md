# Form Sections: Configuration Tab — Issue Breakdown

> **Epic:** autoinstall-generator-7y4 — Form Sections: Configuration Tab
> **Source:** `planning/autoinstall-generator-7y4/implementation-plan.md`
> **Total issues:** 8
> **Estimated tests:** ~44

---

## ISSUE-1: Implement TimezoneForm component

**Type:** task | **Priority:** P2 | **Effort:** S

**Description:**
Create `src/components/TimezoneForm.tsx` and its test file. This component lets the user
enter a timezone string from the IANA database (e.g., `Europe/Berlin`, `UTC`) and dispatches
`SET_TIMEZONE` to the global reducer on every change.

The form has no props — it reads and writes exclusively via `useAutoinstallConfig()`. On
mount it seeds `defaultValues` from `state.timezone`. When the field is empty it dispatches
`undefined` so the `timezone` key is omitted from the generated YAML.

All action types and TypeScript types are already defined in
`src/context/AutoinstallConfigContext.tsx`. No new npm dependencies are needed.

**Acceptance Criteria:**
- [ ] `src/components/TimezoneForm.tsx` exports `function TimezoneForm(): JSX.Element`
- [ ] Component renders a single MUI `TextField` with label "Timezone"
- [ ] `data-testid="timezone-field"` is present on the input
- [ ] Typing `'Europe/Berlin'` into the field causes `state.timezone === 'Europe/Berlin'`
- [ ] Clearing the field causes `state.timezone === undefined` (key absent from YAML)
- [ ] `src/components/TimezoneForm.test.tsx` contains ≥ 5 passing tests
- [ ] `it('has no axe-core critical violations')` test passes with `toHaveNoViolations()`
- [ ] `npm run type-check` passes with zero errors for the new file

**Dependencies:**
- Blocks: ISSUE-8 (FormContent cannot wire this section until component exists)
- Blocked by: none (AutoinstallConfigContext already has `SET_TIMEZONE`)

---

## ISSUE-2: Implement UpdatesForm component

**Type:** task | **Priority:** P2 | **Effort:** S

**Description:**
Create `src/components/UpdatesForm.tsx` and its test file. This component renders a MUI
`Select` for the `updates` field with options `security`, `all`, and a "No preference"
clear option. Dispatches `SET_UPDATES` to the global reducer.

Uses `FormControl` + `InputLabel` + `Controller` from React Hook Form. Zod schema:
`z.object({ updates: z.enum(['security', 'all', '']).optional() })`. Selecting the empty
`''` option dispatches `undefined` so the field is omitted from YAML.

**Acceptance Criteria:**
- [ ] `src/components/UpdatesForm.tsx` exports `function UpdatesForm(): JSX.Element`
- [ ] Select renders three items: "No preference" (`''`), `security`, `all`
- [ ] `data-testid="updates-select"` is present on the select input
- [ ] Selecting `'security'` causes `state.updates === 'security'`
- [ ] Selecting `'all'` causes `state.updates === 'all'`
- [ ] Selecting "No preference" causes `state.updates === undefined`
- [ ] `src/components/UpdatesForm.test.tsx` contains ≥ 5 passing tests
- [ ] `it('has no axe-core critical violations')` test passes
- [ ] `npm run type-check` passes with zero errors for the new file

**Dependencies:**
- Blocks: ISSUE-8
- Blocked by: none

---

## ISSUE-3: Implement ShutdownForm component

**Type:** task | **Priority:** P2 | **Effort:** S

**Description:**
Create `src/components/ShutdownForm.tsx` and its test file. Structurally identical to
`UpdatesForm` but for the `shutdown` field. Options: `reboot`, `poweroff`, and a "No
preference" clear option. Dispatches `SET_SHUTDOWN`.

Zod schema: `z.object({ shutdown: z.enum(['reboot', 'poweroff', '']).optional() })`.
Selecting `''` dispatches `undefined`.

**Acceptance Criteria:**
- [ ] `src/components/ShutdownForm.tsx` exports `function ShutdownForm(): JSX.Element`
- [ ] Select renders three items: "No preference" (`''`), `reboot`, `poweroff`
- [ ] `data-testid="shutdown-select"` is present on the select input
- [ ] Selecting `'reboot'` causes `state.shutdown === 'reboot'`
- [ ] Selecting `'poweroff'` causes `state.shutdown === 'poweroff'`
- [ ] Selecting "No preference" causes `state.shutdown === undefined`
- [ ] `src/components/ShutdownForm.test.tsx` contains ≥ 5 passing tests
- [ ] `it('has no axe-core critical violations')` test passes
- [ ] `npm run type-check` passes with zero errors for the new file

**Dependencies:**
- Blocks: ISSUE-8
- Blocked by: none

---

## ISSUE-4: Implement ReportingForm component

**Type:** task | **Priority:** P2 | **Effort:** M

**Description:**
Create `src/components/ReportingForm.tsx` and its test file. This is the most complex
Configuration-tab component. It manages a `Record<string, ReportingHandler>` where each
handler has a `type` field (required) plus arbitrary string key-value extra fields.

Use local `useState` (not React Hook Form — the dynamic nested structure makes RHF
cumbersome here):

```typescript
interface HandlerEntry {
  name: string        // map key
  type: string
  extras: Array<{ key: string; value: string }>
}
const [handlers, setHandlers] = useState<HandlerEntry[]>([])
```

On every `handlers` change, convert to `Record<string, ReportingHandler>` and dispatch
`SET_REPORTING`. When `handlers` is empty, dispatch `undefined`.

Each handler renders as a `Box` section with:
- TextField for `name` (map key)
- TextField for `type` (required)
- A key-value table with "Add field" / remove-row buttons
- A remove-handler (×) `IconButton`

An "Add handler" `Button` appends a blank entry. An `aria-live="polite"` region
announces "Handler added" / "Handler removed". On mount, seed from `state.reporting`
by converting the Record back to `HandlerEntry[]`.

**Acceptance Criteria:**
- [ ] `src/components/ReportingForm.tsx` exports `function ReportingForm(): JSX.Element`
- [ ] "Add handler" button renders a new handler entry (name + type fields visible)
- [ ] Setting `name='hook'` and `type='webhook'` causes `state.reporting['hook'].type === 'webhook'`
- [ ] Removing the only handler causes `state.reporting === undefined`
- [ ] "Add field" button appends a key-value row to a handler's extras
- [ ] Removing an extra field row removes it from `state.reporting[name]`
- [ ] An `aria-live="polite"` region is present in the rendered output
- [ ] `src/components/ReportingForm.test.tsx` contains ≥ 9 passing tests
- [ ] `it('has no axe-core critical violations')` test passes
- [ ] `npm run type-check` passes with zero errors for the new file

**Dependencies:**
- Blocks: ISSUE-8
- Blocked by: none (`ReportingHandler` type already defined in AutoinstallConfigContext)

---

## ISSUE-5: Implement UserDataForm component

**Type:** task | **Priority:** P2 | **Effort:** M

**Description:**
Create `src/components/UserDataForm.tsx` and its test file. Renders a structured flat form
for the cloud-init `users` module — NOT a YAML textarea (see ADR-001). Six fields:
`name`, `gecos`, `passwd`, `groups`, `shell` (all `TextField`) and `lock_passwd`
(MUI `Switch`).

Use React Hook Form + Zod:
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

`watch()` + `useEffect` dispatches `SET_USER_DATA` on every change. When all fields are
blank/undefined, dispatches `undefined`. `defaultValues` seeded from `state['user-data']`.
Each TextField has `helperText` explaining its cloud-init meaning (e.g., gecos: "Full name / comment").

**Acceptance Criteria:**
- [ ] `src/components/UserDataForm.tsx` exports `function UserDataForm(): JSX.Element`
- [ ] Renders TextFields for `name`, `gecos`, `passwd`, `groups`, `shell`
- [ ] Renders a Switch labelled "Lock password" for `lock_passwd`
- [ ] Typing `'ubuntu'` into `name` causes `state['user-data'].name === 'ubuntu'`
- [ ] Toggling the `lock_passwd` Switch causes `state['user-data'].lock_passwd === true`
- [ ] No element with `data-testid="yaml-editor-textarea"` is present (it is NOT a YAML editor)
- [ ] Clearing all fields causes `state['user-data'] === undefined`
- [ ] `src/components/UserDataForm.test.tsx` contains ≥ 7 passing tests
- [ ] `it('has no axe-core critical violations')` test passes
- [ ] `npm run type-check` passes with zero errors for the new file

**Dependencies:**
- Blocks: ISSUE-8
- Blocked by: none (`UserDataConfig` type already defined in AutoinstallConfigContext)

---

## ISSUE-6: Implement DebconfSelectionsForm component

**Type:** task | **Priority:** P2 | **Effort:** S

**Description:**
Create `src/components/DebconfSelectionsForm.tsx` and its test file. A simple multiline
MUI `TextField` for the `debconf-selections` field. No Zod validation needed (any string
is valid). Use plain `useState` + `onChange` for dispatch — no React Hook Form.

Dispatches `SET_DEBCONF_SELECTIONS` with the current string value. When empty, dispatches
`undefined` to omit the field from YAML.

**Acceptance Criteria:**
- [ ] `src/components/DebconfSelectionsForm.tsx` exports `function DebconfSelectionsForm(): JSX.Element`
- [ ] Renders a multiline TextField with label "Debconf selections" and `minRows={4}`
- [ ] `data-testid="debconf-selections-field"` is present on the input
- [ ] Typing text causes `state['debconf-selections']` to equal that text
- [ ] Clearing the field causes `state['debconf-selections'] === undefined`
- [ ] `src/components/DebconfSelectionsForm.test.tsx` contains ≥ 4 passing tests
- [ ] `it('has no axe-core critical violations')` test passes
- [ ] `npm run type-check` passes with zero errors for the new file

**Dependencies:**
- Blocks: ISSUE-8
- Blocked by: none

---

## ISSUE-7: Implement ZDevsForm component

**Type:** task | **Priority:** P2 | **Effort:** M

**Description:**
Create `src/components/ZDevsForm.tsx` and its test file. Manages a list of
`{id: string, enabled: boolean}` rows rendered as a MUI `Table`. Dispatches `SET_ZDEVS`.

Use local state: `const [rows, setRows] = useState<ZDevConfig[]>([])`. On every `rows`
change, dispatch `SET_ZDEVS` with the array (or `undefined` when empty).

Table columns:
- **ID** — inline `TextField` (editable in place)
- **Enabled** — `Switch` or `Checkbox`
- **Actions** — remove `IconButton` (×)

An "Add device" `Button` appends `{ id: '', enabled: false }`. An `aria-live="polite"`
region announces changes. `defaultValues` seeded from `state.zdevs` on mount.

`data-testid` attributes: `"zdevs-table"`, `"zdevs-add-button"`, `"zdevs-row-{index}"`.

**Acceptance Criteria:**
- [ ] `src/components/ZDevsForm.tsx` exports `function ZDevsForm(): JSX.Element`
- [ ] "Add device" button (`data-testid="zdevs-add-button"`) appends a row to the table
- [ ] Setting `id='0.0.1000'` on a row causes `state.zdevs[0].id === '0.0.1000'`
- [ ] Toggling the enabled switch causes `state.zdevs[0].enabled === true`
- [ ] Removing the only row causes `state.zdevs === undefined`
- [ ] Multiple rows can be added and individually removed
- [ ] An `aria-live="polite"` region is present in the rendered output
- [ ] `src/components/ZDevsForm.test.tsx` contains ≥ 7 passing tests
- [ ] `it('has no axe-core critical violations')` test passes
- [ ] `npm run type-check` passes with zero errors for the new file

**Dependencies:**
- Blocks: ISSUE-8
- Blocked by: none (`ZDevConfig` type already defined in AutoinstallConfigContext)

---

## ISSUE-8: Wire Configuration tab components into FormContent.tsx

**Type:** task | **Priority:** P2 | **Effort:** S

**Description:**
Modify `src/components/FormContent.tsx` to import and render the 7 new Configuration-tab
form components in place of their placeholder children. The `TAB_SECTIONS` constant and
`TabPanel` rendering logic remain unchanged; only the Configuration tab's section children
are replaced.

The Configuration tab (`tab index 5`) currently renders placeholder text ("fields coming
soon") for each accordion section. Replace these with the actual components:

```tsx
<SectionAccordion title="Timezone">    <TimezoneForm />           </SectionAccordion>
<SectionAccordion title="Updates">     <UpdatesForm />            </SectionAccordion>
<SectionAccordion title="Shutdown">    <ShutdownForm />           </SectionAccordion>
<SectionAccordion title="Reporting">   <ReportingForm />          </SectionAccordion>
<SectionAccordion title="User Data">   <UserDataForm />           </SectionAccordion>
<SectionAccordion title="Debconf Selections"> <DebconfSelectionsForm /> </SectionAccordion>
<SectionAccordion title="Z Devices">   <ZDevsForm />              </SectionAccordion>
```

Add 2 new tests to `FormContent.test.tsx` verifying that the Configuration tab renders the
real components (e.g., `data-testid="timezone-field"` is present when the Configuration
tab is active).

**Acceptance Criteria:**
- [ ] `FormContent.tsx` imports all 7 new form components
- [ ] Configuration tab renders `<TimezoneForm />` inside the "Timezone" `SectionAccordion`
- [ ] Configuration tab renders `<ZDevsForm />` inside the "Z Devices" `SectionAccordion`
- [ ] All other tabs (System, Network, Storage, Identity & Auth, Software) are unchanged
- [ ] `FormContent.test.tsx` gains ≥ 2 new passing tests for Configuration tab content
- [ ] `npm run test` passes with zero failures (≥ 44 tests across all new files)
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes with zero errors

**Dependencies:**
- Blocks: autoinstall-generator-vw6 (A11y & Quality Gates epic cannot gate what isn't wired)
- Blocked by: ISSUE-1, ISSUE-2, ISSUE-3, ISSUE-4, ISSUE-5, ISSUE-6, ISSUE-7

---

## Dependency Map

### Critical Path

```
ISSUE-1 (TimezoneForm)          ─┐
ISSUE-2 (UpdatesForm)           ─┤
ISSUE-3 (ShutdownForm)          ─┤
ISSUE-4 (ReportingForm)         ─┼─→ ISSUE-8 (FormContent wire) ─→ autoinstall-generator-vw6
ISSUE-5 (UserDataForm)          ─┤
ISSUE-6 (DebconfSelectionsForm) ─┤
ISSUE-7 (ZDevsForm)             ─┘
```

Longest chain: any single form component → ISSUE-8 (2 steps).

### Parallel Work Opportunities

**Phase 1** — all 7 form component issues are fully independent:
- ISSUE-1, ISSUE-2, ISSUE-3 can run in parallel (simple selects/textfield pattern)
- ISSUE-4, ISSUE-5, ISSUE-7 can run in parallel (medium complexity dynamic components)
- ISSUE-6 can run in parallel with any of the above (simplest component)

**Phase 2** — ISSUE-8 unblocked only after all Phase 1 issues are complete.

### Cross-Epic Dependencies

| Dependency | Type | Direction | Status | Impact |
|-----------|------|-----------|--------|--------|
| autoinstall-generator-pqx (Core State Management) | Hard | Blocks this epic | Closed | All action types and `useAutoinstallConfig` hook must exist before any form component |
| autoinstall-generator-dez (Form Navigation: Tabs & Accordion) | Hard | Blocks this epic | Closed | `SectionAccordion` and `FormContent` accordion scaffolding must exist |
| autoinstall-generator-vw6 (Testing, A11y & Quality Gates) | Hard | Blocked by this epic | In Progress | Quality gate epic depends on all form components being wired and having axe tests |

### Infrastructure Loose Gates

None — this epic is purely frontend React code with no infrastructure dependencies.
