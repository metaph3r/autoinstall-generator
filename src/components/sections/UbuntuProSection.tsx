import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  token: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 24 && val.length <= 30),
      { message: 'Token must be between 24 and 30 characters' }
    ),
})

type FormValues = z.infer<typeof schema>

export function UbuntuProSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: state['ubuntu-pro']?.token ?? '',
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    if (!errors.token) {
      const token = watched.token || undefined
      dispatch({
        type: 'SET_UBUNTU_PRO',
        payload: token !== undefined ? { token } : undefined,
      })
    }
  }, [watched.token, errors.token, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Ubuntu Pro Token"
        helperText={
          errors.token?.message ?? 'Optional token (24–30 characters)'
        }
        error={!!errors.token}
        fullWidth
        inputProps={{ 'data-testid': 'ubuntu-pro-token-field' }}
        {...register('token')}
      />
    </Box>
  )
}
