import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useAutoinstallConfig } from '../context/AutoinstallConfigContext'

const schema = z.object({
  name: z.string().optional(),
  gecos: z.string().optional(),
  passwd: z.string().optional(),
  groups: z.string().optional(),
  shell: z.string().optional(),
  lock_passwd: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function UserDataForm(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const userData = state['user-data']

  const { register, watch, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: userData?.name ?? '',
      gecos: userData?.gecos ?? '',
      passwd: userData?.passwd ?? '',
      groups: userData?.groups ?? '',
      shell: userData?.shell ?? '',
      lock_passwd: userData?.lock_passwd ?? false,
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    const hasAnyValue =
      watched.name ||
      watched.gecos ||
      watched.passwd ||
      watched.groups ||
      watched.shell ||
      watched.lock_passwd

    if (!hasAnyValue) {
      dispatch({ type: 'SET_USER_DATA', payload: undefined })
    } else {
      dispatch({
        type: 'SET_USER_DATA',
        payload: {
          name: watched.name || undefined,
          gecos: watched.gecos || undefined,
          passwd: watched.passwd || undefined,
          groups: watched.groups || undefined,
          shell: watched.shell || undefined,
          lock_passwd: watched.lock_passwd || undefined,
        },
      })
    }
  }, [
    watched.name,
    watched.gecos,
    watched.passwd,
    watched.groups,
    watched.shell,
    watched.lock_passwd,
    dispatch,
  ])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Name"
        fullWidth
        helperText="Username for the initial user"
        inputProps={{ 'data-testid': 'user-data-name-field' }}
        {...register('name')}
      />
      <TextField
        label="GECOS"
        fullWidth
        helperText="Full name / comment"
        inputProps={{ 'data-testid': 'user-data-gecos-field' }}
        {...register('gecos')}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        helperText="Hashed password string"
        inputProps={{ 'data-testid': 'user-data-passwd-field' }}
        {...register('passwd')}
      />
      <TextField
        label="Groups"
        fullWidth
        helperText="Comma-separated supplemental groups"
        inputProps={{ 'data-testid': 'user-data-groups-field' }}
        {...register('groups')}
      />
      <TextField
        label="Shell"
        fullWidth
        helperText="Login shell (e.g. /bin/bash)"
        inputProps={{ 'data-testid': 'user-data-shell-field' }}
        {...register('shell')}
      />
      <Controller
        name="lock_passwd"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value}
                onChange={field.onChange}
                inputProps={{ 'data-testid': 'user-data-lock-passwd-switch' } as React.InputHTMLAttributes<HTMLInputElement>}
              />
            }
            label="Lock password"
          />
        )}
      />
    </Box>
  )
}
