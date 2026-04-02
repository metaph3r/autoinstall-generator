import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

export const TAB_GROUPS = [
  'System',
  'Network',
  'Storage',
  'Identity & Auth',
  'Software',
  'Configuration',
] as const

export type TabGroup = (typeof TAB_GROUPS)[number]

interface FormNavigationProps {
  activeTab: number
  onTabChange: (index: number) => void
}

export function FormNavigation({ activeTab, onTabChange }: FormNavigationProps): JSX.Element {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={(_event, newValue: number) => onTabChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Form section tabs"
      >
        {TAB_GROUPS.map((label, index) => (
          <Tab
            key={label}
            label={label}
            id={`form-tab-${index}`}
            aria-controls={`form-tabpanel-${index}`}
          />
        ))}
      </Tabs>
    </Box>
  )
}
