import { Component } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }
      return (
        <Box>
          <Typography variant="h5">Something went wrong</Typography>
          <Typography>Please reload the page to try again.</Typography>
        </Box>
      )
    }
    return this.props.children
  }
}
