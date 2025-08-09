'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { logError, classifyError } from '@/lib/utils/errors'
import { ENV_CONFIG } from '@/config'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  eventId?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    resetError: () => void
    eventId?: string
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolate?: boolean
  level?: 'page' | 'section' | 'component'
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    const eventId = this.logError(error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
      eventId
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  private logError(error: Error, errorInfo: React.ErrorInfo): string {
    const eventId = Math.random().toString(36).substring(2)
    
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      level: this.props.level || 'component',
      eventId
    })

    return eventId
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: undefined
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
            eventId={this.state.eventId}
          />
        )
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          level={this.props.level}
          eventId={this.state.eventId}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  level?: 'page' | 'section' | 'component'
  eventId?: string
  errorInfo?: React.ErrorInfo
}

function ErrorFallback({ 
  error, 
  resetError, 
  level = 'component',
  eventId,
  errorInfo 
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const { type, severity, userMessage } = classifyError(error)

  const getIconByLevel = () => {
    switch (level) {
      case 'page': return '🚫'
      case 'section': return '⚠️'
      default: return '🔧'
    }
  }

  const getTitleByLevel = () => {
    switch (level) {
      case 'page': return 'Page Error'
      case 'section': return 'Section Error'
      default: return 'Component Error'
    }
  }

  const getDescriptionByLevel = () => {
    switch (level) {
      case 'page': return 'This page encountered an error and could not be displayed.'
      case 'section': return 'This section encountered an error but the rest of the page should work normally.'
      default: return 'This component encountered an error but other parts of the page should work normally.'
    }
  }

  const getSeverityColor = () => {
    switch (severity) {
      case 'low': return 'bg-blue-50 border-blue-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'high': return 'bg-orange-50 border-orange-200'
      case 'critical': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className={`${getSeverityColor()} border-2`}>
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2">{getIconByLevel()}</div>
        <CardTitle className="flex items-center justify-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span>{getTitleByLevel()}</span>
        </CardTitle>
        <CardDescription>{getDescriptionByLevel()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User-friendly error message */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{userMessage}</AlertDescription>
        </Alert>

        {/* Error metadata */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline">{type}</Badge>
          <Badge variant={
            severity === 'critical' ? 'destructive' : 
            severity === 'high' ? 'destructive' :
            severity === 'medium' ? 'secondary' : 
            'outline'
          }>
            {severity}
          </Badge>
          {eventId && (
            <Badge variant="outline" className="font-mono text-xs">
              ID: {eventId.slice(0, 8)}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={resetError} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          {level === 'page' && (
            <Button variant="outline" asChild className="flex-1">
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </a>
            </Button>
          )}

          <Button variant="outline" asChild>
            <a href="/help" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Get Help
            </a>
          </Button>
        </div>

        {/* Technical details (development only or when requested) */}
        {(ENV_CONFIG.isDevelopment || showDetails) && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                <Bug className="mr-2 h-4 w-4" />
                {showDetails ? 'Hide' : 'Show'} Technical Details
                {showDetails ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4">
              {/* Error message */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Error Message:</h4>
                <code className="text-sm break-all">{error.message}</code>
              </div>

              {/* Stack trace */}
              {error.stack && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Stack Trace:</h4>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}

              {/* Component stack */}
              {errorInfo?.componentStack && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Component Stack:</h4>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* Additional info */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Additional Info:</h4>
                <div className="text-sm space-y-1">
                  <div>Time: {new Date().toISOString()}</div>
                  <div>User Agent: {navigator.userAgent}</div>
                  <div>URL: {window.location.href}</div>
                  {eventId && <div>Event ID: {eventId}</div>}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Report issue (production) */}
        {ENV_CONFIG.isProduction && (
          <div className="text-center">
            <Button variant="ghost" size="sm" asChild>
              <a 
                href={`mailto:support@cabofitpass.com?subject=Error Report (${eventId})&body=${encodeURIComponent(`Error: ${error.message}\nEvent ID: ${eventId}\nURL: ${window.location.href}`)}`}
              >
                <Bug className="mr-2 h-4 w-4" />
                Report this issue
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Specific error boundary components for different contexts
export function PageErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ComponentType<any>
}) {
  return (
    <ErrorBoundary level="page" fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

export function SectionErrorBoundary({ 
  children,
  fallback
}: { 
  children: React.ReactNode
  fallback?: React.ComponentType<any>
}) {
  return (
    <ErrorBoundary level="section" fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ 
  children,
  fallback
}: { 
  children: React.ReactNode
  fallback?: React.ComponentType<any>
}) {
  return (
    <ErrorBoundary level="component" fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// Hook for functional components to handle errors
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
    logError(error, { thrownFromHook: true })
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}