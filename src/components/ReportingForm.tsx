import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Typography from '@mui/material/Typography'
import { useAutoinstallConfig } from '../context/AutoinstallConfigContext'
import type { ReportingHandler } from '../context/AutoinstallConfigContext'

interface ExtraField {
  key: string
  value: string
}

interface HandlerEntry {
  name: string
  type: string
  extras: ExtraField[]
}

function toHandlerEntry(name: string, handler: ReportingHandler): HandlerEntry {
  const { type, ...rest } = handler
  return {
    name,
    type,
    extras: Object.entries(rest).map(([k, v]) => ({ key: k, value: String(v) })),
  }
}

export function ReportingForm(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()

  const [handlers, setHandlers] = useState<HandlerEntry[]>(() =>
    state.reporting
      ? Object.entries(state.reporting).map(([name, h]) => toHandlerEntry(name, h))
      : []
  )
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const validHandlers = handlers.filter((h) => h.name && h.type)
    if (validHandlers.length === 0) {
      dispatch({ type: 'SET_REPORTING', payload: undefined })
    } else {
      const reporting: Record<string, ReportingHandler> = {}
      for (const h of validHandlers) {
        const extra: Record<string, string> = {}
        for (const f of h.extras) {
          if (f.key) extra[f.key] = f.value
        }
        reporting[h.name] = { type: h.type, ...extra }
      }
      dispatch({ type: 'SET_REPORTING', payload: reporting })
    }
  }, [handlers, dispatch])

  function addHandler() {
    setHandlers((prev) => [...prev, { name: '', type: '', extras: [] }])
    setAnnouncement('Handler added')
  }

  function removeHandler(index: number) {
    setHandlers((prev) => prev.filter((_, i) => i !== index))
    setAnnouncement('Handler removed')
  }

  function updateHandler(index: number, field: 'name' | 'type', value: string) {
    setHandlers((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    )
  }

  function addExtra(handlerIndex: number) {
    setHandlers((prev) =>
      prev.map((h, i) =>
        i === handlerIndex ? { ...h, extras: [...h.extras, { key: '', value: '' }] } : h
      )
    )
  }

  function removeExtra(handlerIndex: number, extraIndex: number) {
    setHandlers((prev) =>
      prev.map((h, i) =>
        i === handlerIndex
          ? { ...h, extras: h.extras.filter((_, ei) => ei !== extraIndex) }
          : h
      )
    )
  }

  function updateExtra(
    handlerIndex: number,
    extraIndex: number,
    field: 'key' | 'value',
    value: string
  ) {
    setHandlers((prev) =>
      prev.map((h, i) =>
        i === handlerIndex
          ? {
              ...h,
              extras: h.extras.map((e, ei) =>
                ei === extraIndex ? { ...e, [field]: value } : e
              ),
            }
          : h
      )
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div aria-live="polite" data-testid="reporting-announcement">
        {announcement}
      </div>

      {handlers.map((handler, hIdx) => (
        <Box
          key={hIdx}
          sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}
          data-testid={`reporting-handler-${hIdx}`}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
            <TextField
              label="Handler name"
              size="small"
              value={handler.name}
              onChange={(e) => updateHandler(hIdx, 'name', e.target.value)}
              inputProps={{ 'data-testid': `handler-name-${hIdx}` }}
            />
            <TextField
              label="Type"
              size="small"
              value={handler.type}
              onChange={(e) => updateHandler(hIdx, 'type', e.target.value)}
              inputProps={{ 'data-testid': `handler-type-${hIdx}` }}
            />
            <IconButton
              onClick={() => removeHandler(hIdx)}
              aria-label={`Remove handler ${hIdx + 1}`}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Typography variant="caption">Extra fields</Typography>
          {handler.extras.map((extra, eIdx) => (
            <Box
              key={eIdx}
              sx={{ display: 'flex', gap: 1, mt: 0.5 }}
              data-testid={`handler-${hIdx}-extra-${eIdx}`}
            >
              <TextField
                label="Key"
                size="small"
                value={extra.key}
                onChange={(e) => updateExtra(hIdx, eIdx, 'key', e.target.value)}
                inputProps={{ 'data-testid': `handler-${hIdx}-extra-key-${eIdx}` }}
              />
              <TextField
                label="Value"
                size="small"
                value={extra.value}
                onChange={(e) => updateExtra(hIdx, eIdx, 'value', e.target.value)}
                inputProps={{ 'data-testid': `handler-${hIdx}-extra-value-${eIdx}` }}
              />
              <IconButton
                onClick={() => removeExtra(hIdx, eIdx)}
                aria-label={`Remove field ${eIdx + 1} from handler ${hIdx + 1}`}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => addExtra(hIdx)}
            data-testid={`add-field-button-${hIdx}`}
          >
            Add field
          </Button>
        </Box>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addHandler}
        data-testid="add-handler-button"
      >
        Add handler
      </Button>
    </Box>
  )
}
