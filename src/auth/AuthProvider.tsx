import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type AuthSession, type AuthUser } from './api'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'

function getStatus(session: AuthSession): AuthStatus {
  if (session.user) return 'authenticated'
  return session.isGuest ? 'guest' : 'anonymous'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function applySession(session: AuthSession) {
    setUser(session.user)
    setSessionId(session.sessionId)
    setStatus(getStatus(session))
    setError(null)
  }

  useEffect(() => {
    let isMounted = true
    authApi.getSession()
      .then((session) => {
        if (isMounted) applySession(session)
      })
      .catch((sessionError: unknown) => {
        if (isMounted) {
          setStatus('anonymous')
          setError(sessionError instanceof Error ? sessionError.message : 'Unable to check your session.')
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function continueAsGuest() {
    const session = await authApi.continueAsGuest()
    applySession(session)
  }

  async function login(email: string, password: string) {
    const session = await authApi.login(email, password)
    applySession(session)
  }

  async function signup(name: string, email: string, password: string) {
    const session = await authApi.signup(name, email, password)
    applySession(session)
  }

  async function logout() {
    await authApi.logout()
    setUser(null)
    setSessionId(null)
    setStatus('anonymous')
    setError(null)
  }

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    sessionId,
    isGuest: status === 'guest',
    error,
    clearError: () => setError(null),
    continueAsGuest,
    login,
    signup,
    logout,
  }), [status, user, sessionId, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
