import React from 'react'
import { useRTL } from '../../lib/useRTL'

export const RTLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRTL()
  return <>{children}</>
}
