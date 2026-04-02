import { useEffect, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Typography from '@mui/material/Typography'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const snapRowSchema = z.object({
  name: z.string(),
  channel: z.string().optional(),
  classic: z.boolean(),
})

const schema = z.object({
  snaps: z.array(snapRowSchema),
})

type FormValues = z.infer<typeof schema>

export function SnapsSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const announcerRef = useRef<HTMLDivElement>(null)

  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      snaps: (state.snaps ?? []).map((s) => ({
        name: s.name,
        channel: s.channel ?? '',
        classic: s.classic ?? false,
      })),
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'snaps' })

  const watched = watch()

  useEffect(() => {
    const snaps = watched.snaps
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name,
        channel: s.channel || undefined,
        classic: s.classic || undefined,
      }))
    dispatch({
      type: 'SET_SNAPS',
      payload: snaps.length > 0 ? snaps : undefined,
    })
  }, [watched.snaps, dispatch])

  function handleAdd() {
    append({ name: '', channel: '', classic: false })
    if (announcerRef.current) {
      announcerRef.current.textContent = `Snap row added. Total rows: ${fields.length + 1}`
    }
  }

  function handleRemove(index: number) {
    remove(index)
    if (announcerRef.current) {
      announcerRef.current.textContent = `Snap row removed. Total rows: ${fields.length - 1}`
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div
        ref={announcerRef}
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
      />

      {fields.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Typography variant="caption" component="span" sx={{ flex: 2 }}>
              Name
            </Typography>
            <Typography variant="caption" component="span" sx={{ flex: 2 }}>
              Channel
            </Typography>
            <Typography variant="caption" component="span" sx={{ flex: 1 }}>
              Classic
            </Typography>
            <Box sx={{ width: 40 }} />
          </Box>
          {fields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                label={`Snap name ${index + 1}`}
                sx={{ flex: 2 }}
                inputProps={{ 'data-testid': `snap-name-${index}` }}
                {...register(`snaps.${index}.name`)}
              />
              <TextField
                size="small"
                label={`Channel ${index + 1}`}
                sx={{ flex: 2 }}
                inputProps={{ 'data-testid': `snap-channel-${index}` }}
                {...register(`snaps.${index}.channel`)}
              />
              <FormControlLabel
                sx={{ flex: 1 }}
                control={
                  <Checkbox
                    size="small"
                    {...register(`snaps.${index}.classic`)}
                    inputProps={
                      { 'data-testid': `snap-classic-${index}` } as React.InputHTMLAttributes<HTMLInputElement>
                    }
                  />
                }
                label="Classic"
              />
              <IconButton
                onClick={() => handleRemove(index)}
                aria-label={`Remove snap row ${index + 1}`}
                size="small"
                data-testid={`remove-snap-${index}`}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        data-testid="add-snap"
      >
        Add Snap
      </Button>
    </Box>
  )
}
