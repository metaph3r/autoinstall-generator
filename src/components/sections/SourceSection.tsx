import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  search_drivers: z.boolean(),
  id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function SourceSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      search_drivers: state.source?.search_drivers ?? false,
      id: state.source?.id ?? '',
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    const payload: { search_drivers?: boolean; id?: string } = {}
    if (watched.search_drivers) {
      payload.search_drivers = true
    }
    if (watched.id) {
      payload.id = watched.id
    }
    dispatch({
      type: 'SET_SOURCE',
      payload: Object.keys(payload).length > 0 ? payload : undefined,
    })
  }, [watched.search_drivers, watched.id, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControlLabel
        control={
          <Switch
            {...register('search_drivers')}
            inputProps={{ 'data-testid': 'search-drivers-switch' } as React.InputHTMLAttributes<HTMLInputElement>}
          />
        }
        label="Search for drivers"
      />
      <TextField
        label="Source ID"
        helperText="Optional source identifier"
        fullWidth
        inputProps={{ 'data-testid': 'source-id-field' }}
        {...register('id')}
      />
    </Box>
  )
}
