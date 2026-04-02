import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useAutoinstallConfig } from '../context/AutoinstallConfigContext'

export function DebconfSelectionsForm(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const [value, setValue] = useState(state['debconf-selections'] ?? '')

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newVal = e.target.value
    setValue(newVal)
    dispatch({ type: 'SET_DEBCONF_SELECTIONS', payload: newVal || undefined })
  }

  return (
    <Box>
      <TextField
        label="Debconf selections"
        multiline
        minRows={4}
        fullWidth
        value={value}
        onChange={handleChange}
        helperText="Debconf preseed selections (one per line)"
        inputProps={{ 'data-testid': 'debconf-selections-field' }}
      />
    </Box>
  )
}
