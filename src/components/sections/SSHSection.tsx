import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Typography from '@mui/material/Typography'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  installServer: z.boolean(),
  authorizedKeys: z.array(z.object({ value: z.string() })),
  allowPw: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function SSHSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      installServer: state.ssh?.['install-server'] ?? false,
      authorizedKeys: (state.ssh?.['authorized-keys'] ?? []).map((v) => ({ value: v })),
      allowPw: state.ssh?.['allow-pw'] ?? false,
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'authorizedKeys' })

  const watched = watch()

  useEffect(() => {
    const keys = watched.authorizedKeys.map((f) => f.value).filter(Boolean)
    const payload = {
      'install-server': watched.installServer,
      'authorized-keys': keys.length > 0 ? keys : undefined,
      'allow-pw': watched.allowPw,
    }
    dispatch({ type: 'SET_SSH', payload })
  }, [watched.installServer, watched.authorizedKeys, watched.allowPw, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControlLabel
        control={
          <Switch
            {...register('installServer')}
            inputProps={{ 'data-testid': 'install-server-switch' }}
          />
        }
        label="Install SSH Server"
      />

      <Box>
        <Typography variant="subtitle2" component="span" display="block" gutterBottom>
          Authorized Keys
        </Typography>
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              label={`Key ${index + 1}`}
              {...register(`authorizedKeys.${index}.value`)}
            />
            <IconButton
              onClick={() => remove(index)}
              aria-label={`Remove authorized key ${index + 1}`}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => append({ value: '' })}
          data-testid="add-authorized-key"
        >
          Add Key
        </Button>
      </Box>

      <FormControlLabel
        control={
          <Switch
            {...register('allowPw')}
            inputProps={{ 'data-testid': 'allow-pw-switch' }}
          />
        }
        label="Allow Password Authentication"
      />
    </Box>
  )
}
