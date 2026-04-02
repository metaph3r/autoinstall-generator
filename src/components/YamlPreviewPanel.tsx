import { useDeferredValue, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useAutoinstallConfig } from '../context/AutoinstallConfigContext'
import { serializeToYaml } from '../utils/yamlSerializer'
import type { AutoinstallConfig } from '../context/AutoinstallConfigContext'

function getMissingRequiredFields(config: AutoinstallConfig): string[] {
  const missing: string[] = []

  // If user-data is provided, identity requirements are relaxed
  const hasUserData = config['user-data'] !== undefined

  if (!hasUserData) {
    if (!config.identity?.username) missing.push('Identity: Username')
    if (!config.identity?.hostname) missing.push('Identity: Hostname')
    if (!config.identity?.password) missing.push('Identity: Password')
  }

  return missing
}

interface Toast {
  message: string
  severity: 'success' | 'error' | 'warning'
}

export function YamlPreviewPanel(): JSX.Element {
  const { state } = useAutoinstallConfig()
  const [toast, setToast] = useState<Toast | null>(null)

  // Defer re-render of syntax highlighter to avoid blocking input
  const deferredState = useDeferredValue(state)
  const yamlString = serializeToYaml(deferredState)

  function showToast(message: string, severity: Toast['severity']) {
    setToast({ message, severity })
  }

  function handleCloseToast() {
    setToast(null)
  }

  function validateAndGetYaml(): string | null {
    const missing = getMissingRequiredFields(state)
    if (missing.length > 0) {
      showToast(`Missing required fields: ${missing.join(', ')}`, 'warning')
      return null
    }
    return serializeToYaml(state)
  }

  async function handleCopy() {
    const yaml = validateAndGetYaml()
    if (!yaml) return

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(yaml)
        showToast('Copied to clipboard', 'success')
        return
      } catch {
        // Fall through to fallback
      }
    }

    // Fallback for non-HTTPS contexts
    const textarea = document.createElement('textarea')
    textarea.value = yaml
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('Copied to clipboard', 'success')
  }

  function handleDownload() {
    const yaml = validateAndGetYaml()
    if (!yaml) return

    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'autoinstall.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          data-testid="copy-button"
        >
          Copy
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          data-testid="download-button"
        >
          Download
        </Button>
      </Box>

      <Box
        aria-live="polite"
        aria-label="YAML preview"
        sx={{ flex: 1, overflow: 'auto', borderRadius: 1 }}
        data-testid="yaml-preview-content"
      >
        <SyntaxHighlighter
          language="yaml"
          style={oneDark}
          customStyle={{ margin: 0, height: '100%', fontSize: '0.8rem' }}
        >
          {yamlString}
        </SyntaxHighlighter>
      </Box>

      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast?.severity ?? 'info'}
          sx={{ width: '100%' }}
          data-testid="toast-alert"
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
