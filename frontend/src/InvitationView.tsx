import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api, errorFields, type HouseholdInvitation } from './api'
import { Layout } from './Layout'

const fmt = (iso: string) => new Date(iso).toLocaleString('pl-PL')

function statusLabel(inv: HouseholdInvitation) {
  if (inv.status === 'ACCEPTED') return { text: 'Zaakceptowane', className: 'status status-done' }
  if (new Date(inv.expiresAt) < new Date()) return { text: 'Wygasło', className: 'status status-expired' }
  return { text: 'Oczekujące', className: 'status status-open' }
}

export function InvitationView() {
  const [invitations, setInvitations] = useState<HouseholdInvitation[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api.invitations()
      .then(list => { if (!cancelled) setInvitations(list) })
      .catch(err => { if (!cancelled) setError(errorFields(err).error ?? 'Nie udało się pobrać zaproszeń.') })
    return () => { cancelled = true }
  }, [])

  return (
    <Layout
      title="Zaproszenia"
      subtitle="Zaproszenia wysłane do Twojego gospodarstwa."
      actions={<Link className="btn btn-primary" to="/invitations/new">+ Zaproś osobę</Link>}
    >
      {error && <div className="alert alert-error">{error}</div>}
      {invitations === null && !error && <div className="empty">Wczytywanie…</div>}
      {invitations?.length === 0 && <div className="empty">Brak zaproszeń.</div>}

      {invitations && invitations.length > 0 && (
        <div className="task-list">
          {invitations.map(inv => {
            const status = statusLabel(inv)
            return (
              <div key={inv.id} className="task-card">
                <div className="task-info">
                  <div className="task-head">
                    <span className="task-title">{inv.email}</span>
                    <span className={status.className}>{status.text}</span>
                  </div>
                  <div className="task-footnote">Ważne do {fmt(inv.expiresAt)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
