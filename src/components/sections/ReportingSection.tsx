import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Typography from '@mui/material/Typography'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'
import type { ReportingHandler } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  handlers: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
    })
  ),
})

type FormValues = z.infer<typeof schema>

export function ReportingSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const existingHandlers = state.reporting
    ? Object.entries(state.reporting).map(([name, handler]) => ({
        name,
        type: handler.type,
      }))
    : []

  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      handlers: existingHandlers,
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'handlers' })

  const watched = watch()

  useEffect(() => {
    const validHandlers = watched.handlers.filter((h) => h.name && h.type)
    if (validHandlers.length === 0) {
      dispatch({ type: 'SET_REPORTING', payload: undefined })
    } else {
      const reporting: Record<string, ReportingHandler> = {}
      for (const handler of validHandlers) {
        reporting[handler.name] = { type: handler.type }
      }
      dispatch({ type: 'SET_REPORTING', payload: reporting })
    }
  }, [watched.handlers, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" component="span" display="block">
        Reporting Handlers
      </Typography>

      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}
          data-testid={`reporting-handler-row-${index}`}
        >
          <TextField
            label="Name"
            size="small"
            inputProps={{ 'data-testid': `handler-name-${index}` }}
            {...register(`handlers.${index}.name`)}
          />
          <TextField
            label="Type"
            size="small"
            inputProps={{ 'data-testid': `handler-type-${index}` }}
            {...register(`handlers.${index}.type`)}
          />
          <IconButton
            onClick={() => remove(index)}
            aria-label={`Remove handler ${index + 1}`}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => append({ name: '', type: '' })}
        data-testid="add-handler-button"
      >
        Add Handler
      </Button>
    </Box>
  )
}
