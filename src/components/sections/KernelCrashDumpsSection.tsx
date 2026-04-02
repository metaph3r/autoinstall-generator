import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

// Represent the tri-state as a string for the select
const enabledOptions = [
  { value: 'unset', label: 'Unset' },
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
] as const

const schema = z.object({
  enabled: z.enum(['unset', 'true', 'false']),
})

type FormValues = z.infer<typeof schema>

function stateToString(value: boolean | null | undefined): 'unset' | 'true' | 'false' {
  if (value === true) return 'true'
  if (value === false) return 'false'
  // null means explicitly unset by user, undefined means not set
  return 'unset'
}

function stringToState(value: string): boolean | null | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

export function KernelCrashDumpsSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      enabled: stateToString(state['kernel-crash-dumps']),
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    dispatch({
      type: 'SET_KERNEL_CRASH_DUMPS',
      payload: stringToState(watched.enabled),
    })
  }, [watched.enabled, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="kernel-crash-dumps-label">Kernel Crash Dumps</InputLabel>
        <Controller
          name="enabled"
          control={control}
          render={({ field }) => (
            <Select
              labelId="kernel-crash-dumps-label"
              label="Kernel Crash Dumps"
              inputProps={{ 'data-testid': 'kernel-crash-dumps-select' }}
              {...field}
            >
              {enabledOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>
    </Box>
  )
}
