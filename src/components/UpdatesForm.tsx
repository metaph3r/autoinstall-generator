import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useAutoinstallConfig } from '../context/AutoinstallConfigContext'

const schema = z.object({ updates: z.enum(['security', 'all', '']).optional() })
type FormValues = z.infer<typeof schema>

export function UpdatesForm(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const { control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { updates: state.updates ?? '' },
    mode: 'onChange',
  })
  const watched = watch()
  useEffect(() => {
    if (watched.updates === 'security' || watched.updates === 'all') {
      dispatch({ type: 'SET_UPDATES', payload: watched.updates })
    } else {
      dispatch({ type: 'SET_UPDATES', payload: undefined })
    }
  }, [watched.updates, dispatch])
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="updates-label">Updates</InputLabel>
        <Controller
          name="updates"
          control={control}
          render={({ field }) => (
            <Select
              labelId="updates-label"
              label="Updates"
              inputProps={{ 'data-testid': 'updates-select' }}
              {...field}
            >
              <MenuItem value=""><em>No preference</em></MenuItem>
              <MenuItem value="security">security</MenuItem>
              <MenuItem value="all">all</MenuItem>
            </Select>
          )}
        />
      </FormControl>
    </Box>
  )
}
