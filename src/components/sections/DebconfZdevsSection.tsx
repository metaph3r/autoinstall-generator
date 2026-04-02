import { useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Typography from '@mui/material/Typography'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  debconfSelections: z.string().optional(),
  zdevs: z.array(
    z.object({
      id: z.string(),
      enabled: z.boolean(),
    })
  ),
})

type FormValues = z.infer<typeof schema>

export function DebconfZdevsSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const { register, watch, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      debconfSelections: state['debconf-selections'] ?? '',
      zdevs: state.zdevs ?? [],
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'zdevs' })

  const watched = watch()

  useEffect(() => {
    dispatch({
      type: 'SET_DEBCONF_SELECTIONS',
      payload: watched.debconfSelections || undefined,
    })
  }, [watched.debconfSelections, dispatch])

  useEffect(() => {
    const validZdevs = watched.zdevs.filter((z) => z.id)
    dispatch({
      type: 'SET_ZDEVS',
      payload: validZdevs.length > 0 ? validZdevs : undefined,
    })
  }, [watched.zdevs, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" component="span" display="block">
        Debconf Selections
      </Typography>
      <TextField
        label="Debconf Selections"
        multiline
        rows={4}
        fullWidth
        helperText="Optional debconf preseed selections"
        inputProps={{ 'data-testid': 'debconf-selections-field' }}
        {...register('debconfSelections')}
      />

      <Typography variant="subtitle2" component="span" display="block">
        Z Devices
      </Typography>
      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
          data-testid={`zdev-row-${index}`}
        >
          <TextField
            label="Device ID"
            size="small"
            inputProps={{ 'data-testid': `zdev-id-${index}` }}
            {...register(`zdevs.${index}.id`)}
          />
          <Controller
            name={`zdevs.${index}.enabled`}
            control={control}
            render={({ field: switchField }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={switchField.value}
                    onChange={switchField.onChange}
                    inputProps={{ 'data-testid': `zdev-enabled-${index}` } as React.InputHTMLAttributes<HTMLInputElement>}
                  />
                }
                label="Enabled"
              />
            )}
          />
          <IconButton
            onClick={() => remove(index)}
            aria-label={`Remove z device ${index + 1}`}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => append({ id: '', enabled: true })}
        data-testid="add-zdev-button"
      >
        Add Z Device
      </Button>
    </Box>
  )
}
