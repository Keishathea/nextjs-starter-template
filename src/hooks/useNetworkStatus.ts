"use client"

import { useState, useEffect } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // If we were offline, mark that we came back online
      if (!navigator.onLine) {
        setWasOffline(true)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline
  }
}

// Hook for checking if specific features are available offline
export function useOfflineCapabilities() {
  const { isOnline } = useNetworkStatus()

  return {
    canScanImages: true, // TensorFlow.js works offline
    canTranslate: true, // Local dictionary works offline
    canViewDiseases: true, // Local JSON data works offline
    canViewVendors: true, // Local JSON data works offline
    canReportDiseases: isOnline, // Requires internet to send reports
    canUpdateDatabase: isOnline, // Requires internet to sync updates
    canAccessMaps: isOnline, // Maps require internet
    canMakePhoneCalls: true, // Phone calls work offline
    canSendEmails: isOnline // Email requires internet
  }
}

// Hook for network-dependent actions
export function useNetworkActions() {
  const { isOnline } = useNetworkStatus()

  const executeWithNetworkCheck = async <T>(
    action: () => Promise<T>,
    options: {
      requiresNetwork?: boolean
      offlineMessage?: string
      onOffline?: () => void
    } = {}
  ): Promise<T | null> => {
    const {
      requiresNetwork = false,
      offlineMessage = 'This action requires an internet connection.',
      onOffline
    } = options

    if (requiresNetwork && !isOnline) {
      if (onOffline) {
        onOffline()
      } else {
        // You could show a toast notification here
        console.warn(offlineMessage)
      }
      return null
    }

    try {
      return await action()
    } catch (error) {
      console.error('Network action failed:', error)
      throw error
    }
  }

  return {
    executeWithNetworkCheck,
    isOnline
  }
}

// Hook for monitoring connection quality
export function useConnectionQuality() {
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [effectiveType, setEffectiveType] = useState<string>('unknown')

  useEffect(() => {
    // Check if the browser supports the Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection

      const updateConnectionInfo = () => {
        setConnectionType(connection.type || 'unknown')
        setEffectiveType(connection.effectiveType || 'unknown')
      }

      // Set initial values
      updateConnectionInfo()

      // Listen for changes
      connection.addEventListener('change', updateConnectionInfo)

      return () => {
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [])

  const getConnectionQuality = (): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' => {
    switch (effectiveType) {
      case '4g':
        return 'excellent'
      case '3g':
        return 'good'
      case '2g':
        return 'fair'
      case 'slow-2g':
        return 'poor'
      default:
        return 'unknown'
    }
  }

  const shouldOptimizeForSlowConnection = (): boolean => {
    return ['2g', 'slow-2g'].includes(effectiveType)
  }

  return {
    connectionType,
    effectiveType,
    quality: getConnectionQuality(),
    shouldOptimizeForSlowConnection: shouldOptimizeForSlowConnection()
  }
}
