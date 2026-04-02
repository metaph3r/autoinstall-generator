import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  locale: z.string().optional(),
  keyboardLayout: z.string().optional(),
  keyboardVariant: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function LocaleKeyboardSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      locale: state.locale ?? '',
      keyboardLayout: state.keyboard?.layout ?? '',
      keyboardVariant: state.keyboard?.variant ?? '',
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    dispatch({ type: 'SET_LOCALE', payload: watched.locale || undefined })
  }, [watched.locale, dispatch])

  useEffect(() => {
    if (watched.keyboardLayout) {
      dispatch({
        type: 'SET_KEYBOARD',
        payload: {
          layout: watched.keyboardLayout,
          variant: watched.keyboardVariant || undefined,
        },
      })
    } else {
      dispatch({ type: 'SET_KEYBOARD', payload: undefined })
    }
  }, [watched.keyboardLayout, watched.keyboardVariant, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" component="span" display="block">
        Locale
      </Typography>
      <TextField
        label="Locale"
        fullWidth
        helperText="Optional locale (e.g. en_US.UTF-8)"
        inputProps={{ 'data-testid': 'locale-field' }}
        {...register('locale')}
      />

      <Typography variant="subtitle2" component="span" display="block">
        Keyboard
      </Typography>
      <TextField
        label="Keyboard Layout"
        fullWidth
        helperText="Optional keyboard layout (e.g. us)"
        inputProps={{ 'data-testid': 'keyboard-layout-field' }}
        {...register('keyboardLayout')}
      />
      <TextField
        label="Keyboard Variant"
        fullWidth
        helperText="Optional keyboard variant"
        inputProps={{ 'data-testid': 'keyboard-variant-field' }}
        {...register('keyboardVariant')}
      />
    </Box>
  )
}
