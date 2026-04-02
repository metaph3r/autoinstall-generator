import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SectionAccordion } from './SectionAccordion'
import { SystemSection } from './sections/SystemSection'
import { NetworkSection } from './sections/NetworkSection'
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
  Storage: ['Storage Layout / Actions'],
  'Identity & Auth': ['Identity', 'Active Directory', 'Ubuntu Pro', 'SSH'],
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

      {/* Tabs 2-5: Placeholder sections */}
      {([
        { group: 'Storage' as TabGroup, index: 2 },
        { group: 'Identity & Auth' as TabGroup, index: 3 },
        { group: 'Software' as TabGroup, index: 4 },
        { group: 'Configuration' as TabGroup, index: 5 },
      ] as const).map(({ group, index }) => (
        <TabPanel key={group} index={index} activeTab={activeTab}>
          {(PLACEHOLDER_SECTIONS[group] ?? []).length === 1 ? (
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {(PLACEHOLDER_SECTIONS[group] ?? [])[0]} — form fields coming soon
              </Typography>
            </Box>
          ) : (
            (PLACEHOLDER_SECTIONS[group] ?? []).map((section) => (
              <SectionAccordion key={section} title={section}>
                <Typography variant="body2" color="text.secondary">
                  {section} fields coming soon
                </Typography>
              </SectionAccordion>
            ))
          )}
        </TabPanel>
      ))}
    </Box>
  )
}
