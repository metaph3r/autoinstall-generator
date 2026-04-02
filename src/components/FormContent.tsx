import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SectionAccordion } from './SectionAccordion'
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
      {activeTab === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

const TAB_SECTIONS: Record<TabGroup, string[]> = {
  System: ['Version', 'Interactive Sections', 'Refresh Installer', 'Early Commands', 'Late Commands', 'Error Commands'],
  Network: ['Network (Netplan)', 'Proxy'],
  Storage: ['Storage Layout / Actions'],
  'Identity & Auth': ['Identity', 'Active Directory', 'Ubuntu Pro', 'SSH'],
  Software: ['Source', 'APT', 'Codecs', 'Drivers', 'OEM', 'Snaps', 'Packages', 'Kernel', 'Kernel Crash Dumps'],
  Configuration: ['Locale', 'Keyboard', 'Timezone', 'Updates', 'Shutdown', 'Reporting', 'User Data', 'Debconf Selections', 'Z Devices'],
}

const TAB_GROUPS: TabGroup[] = [
  'System',
  'Network',
  'Storage',
  'Identity & Auth',
  'Software',
  'Configuration',
]

interface FormContentProps {
  activeTab: number
}

export function FormContent({ activeTab }: FormContentProps): JSX.Element {
  return (
    <Box>
      {TAB_GROUPS.map((group, index) => (
        <TabPanel key={group} index={index} activeTab={activeTab}>
          {TAB_SECTIONS[group].length === 1 ? (
            // Single-section groups may omit Accordion
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {TAB_SECTIONS[group][0]} — form fields coming soon
              </Typography>
            </Box>
          ) : (
            TAB_SECTIONS[group].map((section) => (
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
