import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import GitHubIcon from '@mui/icons-material/GitHub'
import { FormEditor } from './FormEditor'
import { StartPage } from './StartPage'

type Page = 'start' | 'editor'

export function AppShell(): JSX.Element {
  const [page, setPage] = useState<Page>('start')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Autoinstall Generator
          </Typography>
          <IconButton
            component="a"
            href="https://github.com/metaph3r/autoinstall-generator"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            color="inherit"
          >
            <GitHubIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {page === 'start' ? (
          <StartPage onStart={() => setPage('editor')} />
        ) : (
          <FormEditor />
        )}
      </Box>
    </Box>
  )
}
