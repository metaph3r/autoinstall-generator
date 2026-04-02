import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import EditIcon from '@mui/icons-material/Edit'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'
import { YamlEditorDialog } from '../YamlEditorDialog'

const schema = z.object({
  layout: z.enum(['lvm', 'direct', 'zfs']),
  actionMode: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function StorageSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      layout: state.storage?.layout?.name ?? 'lvm',
      actionMode: state.storage?.actionMode ?? false,
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    dispatch({ type: 'SET_STORAGE_ACTION_MODE', payload: watched.actionMode })
  }, [watched.actionMode, dispatch])

  useEffect(() => {
    if (!watched.actionMode) {
      dispatch({
        type: 'SET_STORAGE_LAYOUT',
        payload: { name: watched.layout },
      })
    }
  }, [watched.layout, watched.actionMode, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControlLabel
        control={
          <Switch
            {...register('actionMode')}
          />
        }
        label="Use Storage Actions instead of layout"
      />

      {watched.actionMode ? (
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setDialogOpen(true)}
            data-testid="edit-storage-actions-button"
          >
            Edit Storage Actions YAML
          </Button>
          {state.storage?.actions && (
            <Box
              component="pre"
              sx={{
                mt: 1,
                p: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: 120,
              }}
              data-testid="storage-actions-preview"
            >
              {state.storage.actions}
            </Box>
          )}
        </Box>
      ) : (
        <FormControl>
          <FormLabel id="storage-layout-label" component="span">
            Storage Layout
          </FormLabel>
          <RadioGroup
            aria-labelledby="storage-layout-label"
            defaultValue={state.storage?.layout?.name ?? 'lvm'}
          >
            {(['lvm', 'direct', 'zfs'] as const).map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio {...register('layout')} value={option} />}
                label={option}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}

      <YamlEditorDialog
        open={dialogOpen}
        section="storage-actions"
        value={state.storage?.actions ?? ''}
        onConfirm={() => {}}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  )
}
