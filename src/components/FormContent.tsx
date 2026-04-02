import Box from '@mui/material/Box'
import { SectionAccordion } from './SectionAccordion'
import { SystemSection } from './sections/SystemSection'
import { NetworkSection } from './sections/NetworkSection'
import { StorageSection } from './sections/StorageSection'
import { IdentitySection } from './sections/IdentitySection'
import { ActiveDirectorySection } from './sections/ActiveDirectorySection'
import { UbuntuProSection } from './sections/UbuntuProSection'
import { SSHSection } from './sections/SSHSection'
import { LocaleKeyboardSection } from './sections/LocaleKeyboardSection'
import { TimezoneForm } from './TimezoneForm'
import { UpdatesForm } from './UpdatesForm'
import { ShutdownForm } from './ShutdownForm'
import { ReportingForm } from './ReportingForm'
import { UserDataForm } from './UserDataForm'
import { DebconfSelectionsForm } from './DebconfSelectionsForm'
import { ZDevsForm } from './ZDevsForm'
import { SourceSection } from './sections/SourceSection'
import { AptSection } from './sections/AptSection'
import { CodecsDriversOemSection } from './sections/CodecsDriversOemSection'
import { SnapsSection } from './sections/SnapsSection'
import { PackagesSection } from './sections/PackagesSection'
import { KernelSection } from './sections/KernelSection'
import { KernelCrashDumpsSection } from './sections/KernelCrashDumpsSection'

interface TabPanelProps {
  index: number
  activeTab: number
  children: React.ReactNode
}

function TabPanel({ index, activeTab, children }: TabPanelProps): JSX.Element {
  return (
    <div
      role="tabpanel"
      hidden={activeTab !== index}
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
    >
      {activeTab === index && <Box sx={{ pt: 2, px: 1 }}>{children}</Box>}
    </div>
  )
}

interface FormContentProps {
  activeTab: number
}

export function FormContent({ activeTab }: FormContentProps): JSX.Element {
  return (
    <Box>
      {/* Tab 0: System */}
      <TabPanel index={0} activeTab={activeTab}>
        <SectionAccordion title="System Settings" defaultExpanded>
          <SystemSection />
        </SectionAccordion>
      </TabPanel>

      {/* Tab 1: Network */}
      <TabPanel index={1} activeTab={activeTab}>
        <SectionAccordion title="Network (Netplan)" defaultExpanded>
          <NetworkSection />
        </SectionAccordion>
      </TabPanel>

      {/* Tab 2: Storage */}
      <TabPanel index={2} activeTab={activeTab}>
        <SectionAccordion title="Storage" defaultExpanded>
          <StorageSection />
        </SectionAccordion>
      </TabPanel>

      {/* Tab 3: Identity & Auth */}
      <TabPanel index={3} activeTab={activeTab}>
        <SectionAccordion title="Identity" defaultExpanded>
          <IdentitySection />
        </SectionAccordion>
        <SectionAccordion title="Active Directory">
          <ActiveDirectorySection />
        </SectionAccordion>
        <SectionAccordion title="Ubuntu Pro">
          <UbuntuProSection />
        </SectionAccordion>
        <SectionAccordion title="SSH">
          <SSHSection />
        </SectionAccordion>
      </TabPanel>

      {/* Tab 4: Software */}
      <TabPanel index={4} activeTab={activeTab}>
        <SectionAccordion title="Source" defaultExpanded>
          <SourceSection />
        </SectionAccordion>
        <SectionAccordion title="APT">
          <AptSection />
        </SectionAccordion>
        <SectionAccordion title="Codecs, Drivers & OEM">
          <CodecsDriversOemSection />
        </SectionAccordion>
        <SectionAccordion title="Snaps">
          <SnapsSection />
        </SectionAccordion>
        <SectionAccordion title="Packages">
          <PackagesSection />
        </SectionAccordion>
        <SectionAccordion title="Kernel">
          <KernelSection />
        </SectionAccordion>
        <SectionAccordion title="Kernel Crash Dumps">
          <KernelCrashDumpsSection />
        </SectionAccordion>
      </TabPanel>

      {/* Tab 5: Configuration */}
      <TabPanel index={5} activeTab={activeTab}>
        <SectionAccordion title="Locale & Keyboard" defaultExpanded>
          <LocaleKeyboardSection />
        </SectionAccordion>
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
      </TabPanel>
    </Box>
  )
}
