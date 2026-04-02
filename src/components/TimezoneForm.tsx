import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { useAutoinstallConfig } from '../context/AutoinstallConfigContext'

const schema = z.object({ timezone: z.string().optional() })
type FormValues = z.infer<typeof schema>

export function TimezoneForm(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { timezone: state.timezone ?? '' },
    mode: 'onChange',
  })
  const watched = watch()
  useEffect(() => {
    dispatch({ type: 'SET_TIMEZONE', payload: watched.timezone || undefined })
  }, [watched.timezone, dispatch])
  return (
    <Box>
      <TextField
        label="Timezone"
        fullWidth
        helperText="IANA timezone (e.g. Europe/Berlin, UTC)"
        inputProps={{ 'data-testid': 'timezone-field' }}
        {...register('timezone')}
      />
    </Box>
  )
}
