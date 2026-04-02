import { useState } from 'react'
import Box from '@mui/material/Box'
import { FormNavigation } from './FormNavigation'
import { FormContent } from './FormContent'
import { YamlPreviewPanel } from './YamlPreviewPanel'

export function FormEditor(): JSX.Element {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: '100%',
      }}
    >
      <Box
        data-testid="form-sections"
        sx={{ flex: { md: '0 0 60%' }, display: 'flex', flexDirection: 'column' }}
      >
        <FormNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <FormContent activeTab={activeTab} />
        </Box>
      </Box>
      <Box
        data-testid="yaml-preview"
        sx={{ flex: { md: '0 0 40%' }, p: 2 }}
      >
        <YamlPreviewPanel />
      </Box>
    </Box>
  )
}
