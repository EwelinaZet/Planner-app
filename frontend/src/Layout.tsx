import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { useSession } from './session'

const NAV = [
  { to: '/tasks', label: 'Zadania' },
  { to: '/calendar', label: 'Kalendarz' },
  { to: '/invitations', label: 'Zaproszenia', end: true },
  { to: '/invitations/new', label: 'Zaproś' },
]

/** Wspólny układ zalogowanych widoków: pasek nawigacji, tytuł strony i treść. */
export function Layout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const { logout } = useSession()

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/tasks" className="brand">
            <span className="brand-mark" aria-hidden="true">✓</span>
            Planer
          </NavLink>
          <nav className="nav">
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Wyloguj</button>
        </div>
      </header>
      <main className="page">
        <div className="page-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </>
  )
}

/** Układ ekranów dla niezalogowanych (logowanie, rejestracja). */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="auth">
      <div className="auth-box">
        <div className="brand brand-lg">
          <span className="brand-mark" aria-hidden="true">✓</span>
          Planer
        </div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
        {children}
      </div>
    </main>
  )
}
