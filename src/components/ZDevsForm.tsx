import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAutoinstallConfig } from '../context/AutoinstallConfigContext'
import type { ZDevConfig } from '../context/AutoinstallConfigContext'

export function ZDevsForm(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const [rows, setRows] = useState<ZDevConfig[]>(state.zdevs ?? [])
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    dispatch({ type: 'SET_ZDEVS', payload: rows.length > 0 ? rows : undefined })
  }, [rows, dispatch])

  function addRow() {
    setRows((prev) => [...prev, { id: '', enabled: false }])
    setAnnouncement('Device row added')
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
    setAnnouncement('Device row removed')
  }

  function updateId(index: number, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, id: value } : r)))
  }

  function updateEnabled(index: number, value: boolean) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, enabled: value } : r)))
  }

  return (
    <Box>
      <div aria-live="polite">{announcement}</div>
      <Table data-testid="zdevs-table" size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Enabled</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} data-testid={`zdevs-row-${index}`}>
              <TableCell>
                <TextField
                  size="small"
                  value={row.id}
                  onChange={(e) => updateId(index, e.target.value)}
                  inputProps={{ 'data-testid': `zdev-id-${index}` }}
                  placeholder="e.g. 0.0.1000"
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={row.enabled}
                  onChange={(e) => updateEnabled(index, e.target.checked)}
                  inputProps={{ 'data-testid': `zdev-enabled-${index}` } as React.InputHTMLAttributes<HTMLInputElement>}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() => removeRow(index)}
                  aria-label={`Remove z device ${index + 1}`}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        startIcon={<AddIcon />}
        onClick={addRow}
        data-testid="zdevs-add-button"
        sx={{ mt: 1 }}
      >
        Add device
      </Button>
    </Box>
  )
}
