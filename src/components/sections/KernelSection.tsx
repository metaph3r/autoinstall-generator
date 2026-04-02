import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  kernelType: z.enum(['package', 'flavor']),
  kernelValue: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function deriveDefaultType(kernel: { package?: string; flavor?: string } | undefined): 'package' | 'flavor' {
  if (kernel?.flavor) return 'flavor'
  return 'package'
}

export function KernelSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kernelType: deriveDefaultType(state.kernel),
      kernelValue: state.kernel?.package ?? state.kernel?.flavor ?? '',
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    if (!watched.kernelValue) {
      dispatch({ type: 'SET_KERNEL', payload: undefined })
      return
    }
    if (watched.kernelType === 'package') {
      dispatch({ type: 'SET_KERNEL', payload: { package: watched.kernelValue } })
    } else {
      dispatch({ type: 'SET_KERNEL', payload: { flavor: watched.kernelValue } })
    }
  }, [watched.kernelType, watched.kernelValue, dispatch])

  const fieldLabel = watched.kernelType === 'package' ? 'Package Name' : 'Flavor Name'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend">Kernel Type</FormLabel>
        <Controller
          name="kernelType"
          control={control}
          render={({ field }) => (
            <RadioGroup row {...field} data-testid="kernel-type-group">
              <FormControlLabel
                value="package"
                control={<Radio inputProps={{ 'data-testid': 'kernel-type-package' } as React.InputHTMLAttributes<HTMLInputElement>} />}
                label="Package"
              />
              <FormControlLabel
                value="flavor"
                control={<Radio inputProps={{ 'data-testid': 'kernel-type-flavor' } as React.InputHTMLAttributes<HTMLInputElement>} />}
                label="Flavor"
              />
            </RadioGroup>
          )}
        />
      </FormControl>

      <TextField
        label={fieldLabel}
        fullWidth
        helperText={`Optional ${fieldLabel.toLowerCase()}`}
        inputProps={{ 'data-testid': 'kernel-value-field' }}
        {...register('kernelValue')}
      />
    </Box>
  )
}
