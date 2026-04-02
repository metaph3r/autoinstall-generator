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

const schema = z.object({ shutdown: z.enum(['reboot', 'poweroff', '']).optional() })
type FormValues = z.infer<typeof schema>

export function ShutdownForm(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const { control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shutdown: state.shutdown ?? '' },
    mode: 'onChange',
  })
  const watched = watch()
  useEffect(() => {
    if (watched.shutdown === 'reboot' || watched.shutdown === 'poweroff') {
      dispatch({ type: 'SET_SHUTDOWN', payload: watched.shutdown })
    } else {
      dispatch({ type: 'SET_SHUTDOWN', payload: undefined })
    }
  }, [watched.shutdown, dispatch])
  return (
    <Box>
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
              <MenuItem value=""><em>No preference</em></MenuItem>
              <MenuItem value="reboot">reboot</MenuItem>
              <MenuItem value="poweroff">poweroff</MenuItem>
            </Select>
          )}
        />
      </FormControl>
    </Box>
  )
}
