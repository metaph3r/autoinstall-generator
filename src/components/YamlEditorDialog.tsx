import { useState, useEffect, useRef } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import { parse } from 'yaml'
import { useAutoinstallConfig } from '../context/AutoinstallConfigContext'

export type YamlEditorSection = 'network' | 'storage-actions'

interface YamlEditorDialogProps {
  open: boolean
  section: YamlEditorSection
  value: string
  onConfirm: (yaml: string) => void
  onClose: () => void
}

const SECTION_LABELS: Record<YamlEditorSection, string> = {
  network: 'Network YAML (Netplan)',
  'storage-actions': 'Storage Actions YAML',
}

const SECTION_DESCRIPTIONS: Record<YamlEditorSection, string> = {
  network: 'Enter valid Netplan YAML for the network configuration.',
  'storage-actions': 'Enter a valid YAML list of storage actions.',
}

export function YamlEditorDialog({
  open,
  section,
  value,
  onConfirm,
  onClose,
}: YamlEditorDialogProps): JSX.Element {
  const [editedYaml, setEditedYaml] = useState(value)
  const [parseError, setParseError] = useState<string | null>(null)
  const { dispatch } = useAutoinstallConfig()
  const titleId = `yaml-editor-dialog-title-${section}`
  const descId = `yaml-editor-dialog-desc-${section}`
  const triggerRef = useRef<Element | null>(null)

  // Sync value when dialog opens
  useEffect(() => {
    if (open) {
      setEditedYaml(value)
      setParseError(null)
      triggerRef.current = document.activeElement
    } else {
      // Return focus to trigger element when dialog closes
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
    }
  }, [open, value])

  function handleConfirm() {
    try {
      parse(editedYaml)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid YAML')
      return
    }

    if (section === 'network') {
      dispatch({ type: 'SET_NETWORK', payload: editedYaml })
    } else {
      dispatch({ type: 'SET_STORAGE_ACTIONS', payload: editedYaml })
    }

    onConfirm(editedYaml)
    onClose()
  }

  function handleClose() {
    setParseError(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={descId}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id={titleId}>{SECTION_LABELS[section]}</DialogTitle>
      <DialogContent>
        <p id={descId} style={{ margin: '0 0 12px' }}>
          {SECTION_DESCRIPTIONS[section]}
        </p>
        {parseError && (
          <Alert severity="error" sx={{ mb: 2 }} data-testid="yaml-parse-error">
            Invalid YAML: {parseError}
          </Alert>
        )}
        <TextField
          multiline
          fullWidth
          minRows={12}
          value={editedYaml}
          onChange={(e) => {
            setEditedYaml(e.target.value)
            setParseError(null)
          }}
          inputProps={{
            'aria-label': `${SECTION_LABELS[section]} editor`,
            style: { fontFamily: 'monospace', fontSize: '0.875rem' },
          }}
          data-testid="yaml-editor-textarea"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" data-testid="yaml-confirm-button">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
