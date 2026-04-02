import { AutoinstallConfigProvider } from './context/AutoinstallConfigContext'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AutoinstallConfigProvider>
        <AppShell />
      </AutoinstallConfigProvider>
    </ErrorBoundary>
  )
}

export default App
