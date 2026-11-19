import { useEffect, useState } from 'react'
import { api, type Invitation } from './api'

const fmt = (iso: string) => new Date(iso).toLocaleString('pl-PL')

function statusLabel(inv: Invitation) {
  if (inv.status === 'ACCEPTED') return { text: 'Zaakceptowane', className: 'status status-done' }
  if (new Date(inv.expiresAt) < new Date()) return { text: 'Wygasło', className: 'status status-expired' }
  return { text: 'Oczekujące', className: 'status status-open' }
}

export function InvitationView({ onTasks, onLogout }: { onTasks: () => void; onLogout: () => void }) {
  const [invitations, setInvitations] = useState<Invitation[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.invitations()
      .then(setInvitations)
      .catch(() => setError('Nie udało się pobrać zaproszeń'))
  }, [])

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>Zaproszenia</h1>
          <p>Zaproszenia wysłane do Twojego gospodarstwa.</p>
          <button className="link" onClick={onTasks}>← Lista zadań</button>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>Wyloguj</button>
      </div>

      {error && <div className="error">{error}</div>}

      {invitations && invitations.length === 0 && <div className="empty">Brak zaproszeń.</div>}

      {invitations && invitations.length > 0 && (
        <div className="task-list">
          {invitations.map(inv => {
            const status = statusLabel(inv)
            return (
              <div key={inv.id} className="task-card">
                <div className="task-info">
                  <div className="task-title">
                    {inv.email}
                    <span className={status.className}>{status.text}</span>
                  </div>
                  <div className="task-meta">Ważne do: {fmt(inv.expiresAt)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
