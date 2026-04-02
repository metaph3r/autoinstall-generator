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
import Typography from '@mui/material/Typography'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const oemOptions = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
  { value: 'auto', label: 'Auto' },
] as const

const schema = z.object({
  codecsInstall: z.boolean(),
  driversInstall: z.boolean(),
  oem: z.enum(['true', 'false', 'auto', '']),
})

type FormValues = z.infer<typeof schema>

function oemValueFromState(oem: boolean | 'auto' | undefined): 'true' | 'false' | 'auto' | '' {
  if (oem === true) return 'true'
  if (oem === false) return 'false'
  if (oem === 'auto') return 'auto'
  return ''
}

function oemValueToState(value: string): boolean | 'auto' | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'auto') return 'auto'
  return undefined
}

export function CodecsDriversOemSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      codecsInstall: state.codecs?.install ?? false,
      driversInstall: state.drivers?.install ?? false,
      oem: oemValueFromState(state.oem),
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    dispatch({
      type: 'SET_CODECS',
      payload: watched.codecsInstall ? { install: true } : undefined,
    })
  }, [watched.codecsInstall, dispatch])

  useEffect(() => {
    dispatch({
      type: 'SET_DRIVERS',
      payload: watched.driversInstall ? { install: true } : undefined,
    })
  }, [watched.driversInstall, dispatch])

  useEffect(() => {
    dispatch({
      type: 'SET_OEM',
      payload: oemValueToState(watched.oem),
    })
  }, [watched.oem, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" component="span" display="block">
        Codecs
      </Typography>
      <FormControlLabel
        control={<Switch {...register('codecsInstall')} data-testid="codecs-install-switch" />}
        label="Install Codecs"
      />

      <Typography variant="subtitle2" component="span" display="block">
        Drivers
      </Typography>
      <FormControlLabel
        control={<Switch {...register('driversInstall')} data-testid="drivers-install-switch" />}
        label="Install Drivers"
      />

      <FormControl fullWidth>
        <InputLabel id="oem-label">OEM</InputLabel>
        <Controller
          name="oem"
          control={control}
          render={({ field }) => (
            <Select
              labelId="oem-label"
              label="OEM"
              data-testid="oem-select"
              {...field}
            >
              <MenuItem value="">
                <em>Unset</em>
              </MenuItem>
              {oemOptions.map((opt) => (
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
