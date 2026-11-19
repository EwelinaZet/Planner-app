import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { api, onUnauthorized } from './api'

type Status = 'loading' | 'signedIn' | 'signedOut'

interface Session {
  status: Status
  /** Wywołaj po udanym logowaniu/rejestracji. */
  signedIn: () => void
  logout: () => Promise<void>
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    api.me()
      .then(() => setStatus('signedIn'))
      .catch(() => setStatus('signedOut'))
  }, [])

  // Każde 401 z API (np. wygasła sesja) wylogowuje — RequireAuth przekieruje wtedy na /login.
  useEffect(() => {
    onUnauthorized(() => setStatus('signedOut'))
    return () => onUnauthorized(null)
  }, [])

  const value = useMemo<Session>(
    () => ({
      status,
      signedIn: () => setStatus('signedIn'),
      logout: () => api.logout().catch(() => {}).finally(() => setStatus('signedOut')),
    }),
    [status],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession musi być użyte wewnątrz <SessionProvider>')
  return session
}

/** Trasy tylko dla zalogowanych; niezalogowanego odsyła na /login i zapamiętuje, skąd przyszedł. */
export function RequireAuth() {
  const { status } = useSession()
  const location = useLocation()
  if (status === 'loading') return null
  if (status === 'signedOut') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Trasy tylko dla niezalogowanych (logowanie, rejestracja). */
export function GuestOnly() {
  const { status } = useSession()
  if (status === 'loading') return null
  if (status === 'signedIn') return <Navigate to="/tasks" replace />
  return <Outlet />
}
