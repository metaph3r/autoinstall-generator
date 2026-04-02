import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export interface StartPageProps {
  onStart: () => void
}

export function StartPage({ onStart }: StartPageProps): JSX.Element {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Autoinstall Generator
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Generate Ubuntu autoinstall configuration files for unattended server installations.
      </Typography>
      <Button variant="contained" onClick={onStart}>
        New Project
      </Button>
    </Box>
  )
}
