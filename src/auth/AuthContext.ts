import { createContext, useContext } from 'react'
import type { AuthUser } from './api'

export type AuthStatus = 'loading' | 'anonymous' | 'guest' | 'authenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  sessionId: string | null
  isGuest: boolean
  error: string | null
  clearError: () => void
  continueAsGuest: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider.')
  return context
}
