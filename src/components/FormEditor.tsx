import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export function FormEditor(): JSX.Element {
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
        sx={{ flex: { md: '0 0 60%' }, p: 2 }}
      >
        <Typography color="text.secondary">Form sections</Typography>
      </Box>
      <Box
        data-testid="yaml-preview"
        sx={{ flex: { md: '0 0 40%' }, p: 2 }}
      >
        <Typography color="text.secondary">YAML preview</Typography>
      </Box>
    </Box>
  )
}
