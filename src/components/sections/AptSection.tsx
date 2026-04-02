import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'
import type { AptConfig } from '../../context/AutoinstallConfigContext'

const fallbackOptions = [
  { value: 'abort', label: 'Abort' },
  { value: 'continue-anyway', label: 'Continue Anyway' },
  { value: 'offline-install', label: 'Offline Install' },
] as const

const schema = z.object({
  preserve_sources_list: z.boolean(),
  fallback: z.enum(['abort', 'continue-anyway', 'offline-install', '']),
  geoip: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function AptSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preserve_sources_list: state.apt?.preserve_sources_list ?? false,
      fallback: state.apt?.fallback ?? '',
      geoip: state.apt?.geoip ?? false,
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    const payload: AptConfig = {}
    if (watched.preserve_sources_list) {
      payload.preserve_sources_list = true
    }
    if (watched.fallback) {
      payload.fallback = watched.fallback as AptConfig['fallback']
    }
    if (watched.geoip) {
      payload.geoip = true
    }
    dispatch({
      type: 'SET_APT',
      payload: Object.keys(payload).length > 0 ? payload : undefined,
    })
  }, [watched.preserve_sources_list, watched.fallback, watched.geoip, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControlLabel
        control={
          <Switch
            {...register('preserve_sources_list')}
            inputProps={
              { 'data-testid': 'preserve-sources-list-switch' } as React.InputHTMLAttributes<HTMLInputElement>
            }
          />
        }
        label="Preserve Sources List"
      />

      <FormControl fullWidth>
        <InputLabel id="apt-fallback-label">Fallback</InputLabel>
        <Controller
          name="fallback"
          control={control}
          render={({ field }) => (
            <Select
              labelId="apt-fallback-label"
              label="Fallback"
              inputProps={{ 'data-testid': 'apt-fallback-select' }}
              {...field}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {fallbackOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            {...register('geoip')}
            inputProps={
              { 'data-testid': 'geoip-switch' } as React.InputHTMLAttributes<HTMLInputElement>
            }
          />
        }
        label="Geoip"
      />
    </Box>
  )
}
