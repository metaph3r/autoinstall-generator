import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import EditIcon from '@mui/icons-material/Edit'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'
import { YamlEditorDialog } from '../YamlEditorDialog'

const schema = z.object({
  proxy: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function NetworkSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { register } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { proxy: state.proxy ?? '' },
    mode: 'onChange',
  })

  function handleProxyChange(value: string) {
    dispatch({ type: 'SET_PROXY', payload: value || undefined })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setDialogOpen(true)}
          data-testid="edit-network-yaml-button"
        >
          Edit Network YAML
        </Button>
        {state.network && (
          <Box
            component="pre"
            sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.75rem', overflow: 'auto', maxHeight: 120 }}
            data-testid="network-yaml-preview"
          >
            {state.network}
          </Box>
        )}
      </Box>

      <TextField
        label="Proxy"
        helperText="Optional proxy URI (e.g. http://proxy.example.com:3128)"
        fullWidth
        {...register('proxy')}
        onChange={(e) => handleProxyChange(e.target.value)}
      />

      <YamlEditorDialog
        open={dialogOpen}
        section="network"
        value={state.network ?? ''}
        onConfirm={() => {}}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  )
}
