import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SectionAccordion } from './SectionAccordion'
import { SystemSection } from './sections/SystemSection'
import { NetworkSection } from './sections/NetworkSection'
import { StorageSection } from './sections/StorageSection'
import { IdentitySection } from './sections/IdentitySection'
import { ActiveDirectorySection } from './sections/ActiveDirectorySection'
import { UbuntuProSection } from './sections/UbuntuProSection'
import { SSHSection } from './sections/SSHSection'
import type { TabGroup } from './FormNavigation'

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

// Placeholder sections for tabs not yet implemented
const PLACEHOLDER_SECTIONS: Partial<Record<TabGroup, string[]>> = {
  Software: ['Source', 'APT', 'Codecs', 'Drivers', 'OEM', 'Snaps', 'Packages', 'Kernel', 'Kernel Crash Dumps'],
  Configuration: ['Locale', 'Keyboard', 'Timezone', 'Updates', 'Shutdown', 'Reporting', 'User Data', 'Debconf Selections', 'Z Devices'],
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

      {/* Tabs 4-5: Placeholder sections */}
      {([
        { group: 'Software' as TabGroup, index: 4 },
        { group: 'Configuration' as TabGroup, index: 5 },
      ] as const).map(({ group, index }) => (
        <TabPanel key={group} index={index} activeTab={activeTab}>
          {(PLACEHOLDER_SECTIONS[group] ?? []).map((section) => (
            <SectionAccordion key={section} title={section}>
              <Typography variant="body2" color="text.secondary">
                {section} fields coming soon
              </Typography>
            </SectionAccordion>
          ))}
        </TabPanel>
      ))}
    </Box>
  )
}
