import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  realname: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  hostname: z.string().min(1, 'Hostname is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function IdentitySection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      realname: state.identity?.realname ?? '',
      username: state.identity?.username ?? '',
      hostname: state.identity?.hostname ?? '',
      password: state.identity?.password ?? '',
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    if (!errors.username && !errors.hostname && !errors.password) {
      dispatch({
        type: 'SET_IDENTITY',
        payload: {
          realname: watched.realname || undefined,
          username: watched.username,
          hostname: watched.hostname,
          password: watched.password,
        },
      })
    }
  }, [
    watched.realname,
    watched.username,
    watched.hostname,
    watched.password,
    errors.username,
    errors.hostname,
    errors.password,
    dispatch,
  ])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Real Name"
        helperText="Optional display name"
        fullWidth
        inputProps={{ 'data-testid': 'realname-field' }}
        {...register('realname')}
      />
      <TextField
        label="Username"
        required
        fullWidth
        error={!!errors.username}
        helperText={errors.username?.message ?? 'Login username'}
        inputProps={{ 'data-testid': 'username-field' }}
        {...register('username')}
      />
      <TextField
        label="Hostname"
        required
        fullWidth
        error={!!errors.hostname}
        helperText={errors.hostname?.message ?? 'Machine hostname'}
        inputProps={{ 'data-testid': 'hostname-field' }}
        {...register('hostname')}
      />
      <TextField
        label="Password"
        type="password"
        required
        fullWidth
        error={!!errors.password}
        helperText={errors.password?.message ?? 'User password (will be hashed)'}
        inputProps={{ 'data-testid': 'password-field' }}
        {...register('password')}
      />
    </Box>
  )
}
