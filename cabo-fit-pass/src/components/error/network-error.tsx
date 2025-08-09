'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  Router,
  Globe,
  Settings
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'

interface NetworkErrorProps {
  onRetry?: () => void | Promise<void>
  error?: Error
  showReconnecting?: boolean
  retryCount?: number
  maxRetries?: number
}

export function NetworkError({ 
  onRetry, 
  error,
  showReconnecting = false,
  retryCount = 0,
  maxRetries = 3
}: NetworkErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { toast } = useToast()

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: '🟢 Back online',
        description: 'Your internet connection has been restored.'
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: '🔴 You are offline',
        description: 'Check your internet connection.',
        variant: 'destructive'
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [toast])

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return

    setIsRetrying(true)
    try {
      await onRetry()
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorType = () => {
    if (!isOnline) return 'offline'
    if (error?.message.includes('timeout') || error?.message.includes('TIMEOUT')) return 'timeout'
    if (error?.message.includes('ECONNREFUSED') || error?.message.includes('NETWORK_ERROR')) return 'refused'
    if (error?.message.includes('fetch')) return 'fetch'
    return 'unknown'
  }

  const getErrorInfo = () => {
    const type = getErrorType()
    
    switch (type) {
      case 'offline':
        return {
          title: 'You are offline',
          description: 'Check your internet connection to continue using CaboFitPass.',
          icon: WifiOff,
          color: 'text-red-500',
          suggestion: 'Connect to Wi-Fi or check your mobile data connection.'
        }
      case 'timeout':
        return {
          title: 'Connection timeout',
          description: 'The request took too long to complete.',
          icon: Router,
          color: 'text-orange-500',
          suggestion: 'Your connection might be slow. Try again or check your network.'
        }
      case 'refused':
        return {
          title: 'Connection refused',
          description: 'Unable to connect to our servers.',
          icon: Globe,
          color: 'text-red-500',
          suggestion: 'Our servers might be temporarily unavailable. Please try again.'
        }
      case 'fetch':
        return {
          title: 'Network request failed',
          description: 'Failed to fetch data from the server.',
          icon: AlertTriangle,
          color: 'text-yellow-500',
          suggestion: 'There was a problem with the network request. Please try again.'
        }
      default:
        return {
          title: 'Network error',
          description: error?.message || 'An unknown network error occurred.',
          icon: AlertTriangle,
          color: 'text-gray-500',
          suggestion: 'Please check your connection and try again.'
        }
    }
  }

  const errorInfo = getErrorInfo()
  const Icon = errorInfo.icon
  const canRetry = onRetry && isOnline && retryCount < maxRetries

  return (
    <Card className="border-2 border-muted">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Icon className={`h-12 w-12 ${errorInfo.color}`} />
            {showReconnecting && (
              <div className="absolute -top-1 -right-1">
                <div className="h-4 w-4 bg-yellow-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
        
        <CardTitle className="flex items-center justify-center space-x-2">
          <span>{errorInfo.title}</span>
          {!isOnline && (
            <Badge variant="destructive" className="ml-2">
              Offline
            </Badge>
          )}
        </CardTitle>
        
        <CardDescription>{errorInfo.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status indicator */}
        <Alert>
          <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
          <AlertDescription>
            Network status: {isOnline ? 'Online' : 'Offline'}
            {retryCount > 0 && (
              <span className="ml-2 text-muted-foreground">
                (Attempt {retryCount + 1} of {maxRetries + 1})
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Suggestion */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 {errorInfo.suggestion}
          </p>
        </div>

        {/* Troubleshooting steps */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Troubleshooting steps:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Disable VPN if you're using one</li>
            <li>• Clear your browser cache</li>
            {!isOnline && <li>• Connect to Wi-Fi or mobile data</li>}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {canRetry && (
            <Button 
              onClick={handleRetry}
              disabled={isRetrying || !isOnline}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>

          <Button variant="ghost" asChild>
            <a href="/help">
              <Settings className="mr-2 h-4 w-4" />
              Help
            </a>
          </Button>
        </div>

        {/* Auto-retry indicator */}
        {showReconnecting && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>Attempting to reconnect...</span>
            </div>
          </div>
        )}

        {/* Developer info (development only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Developer Info
            </summary>
            <div className="bg-muted p-3 rounded text-xs font-mono">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for network error handling
export function useNetworkError() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastError, setLastError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleNetworkError = (error: Error) => {
    setLastError(error)
    
    if (!isOnline) {
      toast({
        title: 'You are offline',
        description: 'Please check your connection.',
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Network Error',
        description: 'Failed to connect. Please try again.',
        variant: 'destructive'
      })
    }
  }

  return {
    isOnline,
    lastError,
    handleNetworkError,
    clearError: () => setLastError(null)
  }
}