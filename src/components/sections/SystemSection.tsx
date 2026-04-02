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
  version: z.number().int().min(1),
  interactiveSections: z.array(z.object({ value: z.string() })),
  refreshInstallerEnabled: z.boolean(),
  refreshInstallerChannel: z.string().optional(),
  earlyCommands: z.array(z.object({ value: z.string() })),
  lateCommands: z.array(z.object({ value: z.string() })),
  errorCommands: z.array(z.object({ value: z.string() })),
})

type FormValues = z.infer<typeof schema>

export function SystemSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      version: state.version,
      interactiveSections: (state['interactive-sections'] ?? []).map((v) => ({ value: v })),
      refreshInstallerEnabled: state['refresh-installer']?.update ?? false,
      refreshInstallerChannel: state['refresh-installer']?.channel ?? '',
      earlyCommands: (state['early-commands'] ?? []).map((v) => ({ value: v })),
      lateCommands: (state['late-commands'] ?? []).map((v) => ({ value: v })),
      errorCommands: (state['error-commands'] ?? []).map((v) => ({ value: v })),
    },
    mode: 'onChange',
  })

  const {
    fields: interactiveFields,
    append: appendInteractive,
    remove: removeInteractive,
  } = useFieldArray({ control, name: 'interactiveSections' })

  const {
    fields: earlyFields,
    append: appendEarly,
    remove: removeEarly,
  } = useFieldArray({ control, name: 'earlyCommands' })

  const {
    fields: lateFields,
    append: appendLate,
    remove: removeLate,
  } = useFieldArray({ control, name: 'lateCommands' })

  const {
    fields: errorFields,
    append: appendError,
    remove: removeError,
  } = useFieldArray({ control, name: 'errorCommands' })

  const watched = watch()

  useEffect(() => {
    if (!errors.version) {
      dispatch({ type: 'SET_VERSION', payload: watched.version })
    }
  }, [watched.version, errors.version, dispatch])

  useEffect(() => {
    const sections = watched.interactiveSections.map((f) => f.value).filter(Boolean)
    dispatch({
      type: 'SET_INTERACTIVE_SECTIONS',
      payload: sections.length > 0 ? sections : undefined,
    })
  }, [watched.interactiveSections, dispatch])

  useEffect(() => {
    if (watched.refreshInstallerEnabled) {
      dispatch({
        type: 'SET_REFRESH_INSTALLER',
        payload: {
          update: true,
          channel: watched.refreshInstallerChannel || undefined,
        },
      })
    } else {
      dispatch({ type: 'SET_REFRESH_INSTALLER', payload: undefined })
    }
  }, [watched.refreshInstallerEnabled, watched.refreshInstallerChannel, dispatch])

  useEffect(() => {
    const cmds = watched.earlyCommands.map((f) => f.value).filter(Boolean)
    dispatch({ type: 'SET_EARLY_COMMANDS', payload: cmds.length > 0 ? cmds : undefined })
  }, [watched.earlyCommands, dispatch])

  useEffect(() => {
    const cmds = watched.lateCommands.map((f) => f.value).filter(Boolean)
    dispatch({ type: 'SET_LATE_COMMANDS', payload: cmds.length > 0 ? cmds : undefined })
  }, [watched.lateCommands, dispatch])

  useEffect(() => {
    const cmds = watched.errorCommands.map((f) => f.value).filter(Boolean)
    dispatch({ type: 'SET_ERROR_COMMANDS', payload: cmds.length > 0 ? cmds : undefined })
  }, [watched.errorCommands, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Version"
        type="number"
        required
        inputProps={{ min: 1, 'data-testid': 'version-field' }}
        error={!!errors.version}
        helperText={errors.version?.message ?? 'Schema version (always 1)'}
        {...register('version', { valueAsNumber: true })}
      />

      <Box>
        <Typography variant="subtitle2" component="span" display="block" gutterBottom>
          Interactive Sections
        </Typography>
        {interactiveFields.map((field, index) => (
          <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              label={`Section ${index + 1}`}
              {...register(`interactiveSections.${index}.value`)}
            />
            <IconButton
              onClick={() => removeInteractive(index)}
              aria-label={`Remove interactive section ${index + 1}`}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => appendInteractive({ value: '' })}
          data-testid="add-interactive-section"
        >
          Add Section
        </Button>
      </Box>

      <FormControlLabel
        control={<Switch {...register('refreshInstallerEnabled')} />}
        label="Refresh Installer"
      />
      {watched.refreshInstallerEnabled && (
        <TextField
          label="Channel"
          size="small"
          helperText="Optional update channel (e.g. stable)"
          {...register('refreshInstallerChannel')}
        />
      )}

      {[
        {
          label: 'Early Commands',
          fields: earlyFields,
          append: appendEarly,
          remove: removeEarly,
          name: 'earlyCommands' as const,
          testId: 'add-early-command',
        },
        {
          label: 'Late Commands',
          fields: lateFields,
          append: appendLate,
          remove: removeLate,
          name: 'lateCommands' as const,
          testId: 'add-late-command',
        },
        {
          label: 'Error Commands',
          fields: errorFields,
          append: appendError,
          remove: removeError,
          name: 'errorCommands' as const,
          testId: 'add-error-command',
        },
      ].map(({ label, fields, append, remove, name, testId }) => (
        <Box key={name}>
          <Typography variant="subtitle2" component="span" display="block" gutterBottom>
            {label}
          </Typography>
          {fields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                label={`Command ${index + 1}`}
                {...register(`${name}.${index}.value`)}
              />
              <IconButton
                onClick={() => remove(index)}
                aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
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
            data-testid={testId}
          >
            Add Command
          </Button>
        </Box>
      ))}
    </Box>
  )
}
