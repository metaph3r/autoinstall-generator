import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  adminName: z.string().optional(),
  domainName: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ActiveDirectorySection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      adminName: state['active-directory']?.['admin-name'] ?? '',
      domainName: state['active-directory']?.['domain-name'] ?? '',
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    const adminName = watched.adminName || undefined
    const domainName = watched.domainName || undefined
    if (adminName !== undefined || domainName !== undefined) {
      dispatch({
        type: 'SET_ACTIVE_DIRECTORY',
        payload: {
          'admin-name': adminName,
          'domain-name': domainName,
        },
      })
    } else {
      dispatch({ type: 'SET_ACTIVE_DIRECTORY', payload: undefined })
    }
  }, [watched.adminName, watched.domainName, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Admin Name"
        helperText="Optional Active Directory admin username"
        fullWidth
        inputProps={{ 'data-testid': 'ad-admin-name-field' }}
        {...register('adminName')}
      />
      <TextField
        label="Domain Name"
        helperText="Optional Active Directory domain (e.g. example.com)"
        fullWidth
        inputProps={{ 'data-testid': 'ad-domain-name-field' }}
        {...register('domainName')}
      />
    </Box>
  )
}
