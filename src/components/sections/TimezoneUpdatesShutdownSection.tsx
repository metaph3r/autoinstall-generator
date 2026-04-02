import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  timezone: z.string().optional(),
  updates: z.enum(['security', 'all', '']).optional(),
  shutdown: z.enum(['reboot', 'poweroff', '']).optional(),
})

type FormValues = z.infer<typeof schema>

export function TimezoneUpdatesShutdownSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, watch, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      timezone: state.timezone ?? '',
      updates: state.updates ?? '',
      shutdown: state.shutdown ?? '',
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    dispatch({ type: 'SET_TIMEZONE', payload: watched.timezone || undefined })
  }, [watched.timezone, dispatch])

  useEffect(() => {
    if (watched.updates === 'security' || watched.updates === 'all') {
      dispatch({ type: 'SET_UPDATES', payload: watched.updates })
    } else {
      dispatch({ type: 'SET_UPDATES', payload: undefined })
    }
  }, [watched.updates, dispatch])

  useEffect(() => {
    if (watched.shutdown === 'reboot' || watched.shutdown === 'poweroff') {
      dispatch({ type: 'SET_SHUTDOWN', payload: watched.shutdown })
    } else {
      dispatch({ type: 'SET_SHUTDOWN', payload: undefined })
    }
  }, [watched.shutdown, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Timezone"
        fullWidth
        helperText="Optional timezone (e.g. Europe/Berlin)"
        inputProps={{ 'data-testid': 'timezone-field' }}
        {...register('timezone')}
      />

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
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="security">security</MenuItem>
              <MenuItem value="all">all</MenuItem>
            </Select>
          )}
        />
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="shutdown-label">Shutdown</InputLabel>
        <Controller
          name="shutdown"
          control={control}
          render={({ field }) => (
            <Select
              labelId="shutdown-label"
              label="Shutdown"
              inputProps={{ 'data-testid': 'shutdown-select' }}
              {...field}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="reboot">reboot</MenuItem>
              <MenuItem value="poweroff">poweroff</MenuItem>
            </Select>
          )}
        />
      </FormControl>
    </Box>
  )
}
