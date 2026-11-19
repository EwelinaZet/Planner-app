import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router'
import { api, errorFields } from './api'
import type { HouseholdInvitation } from './api'
import { Layout } from './Layout'

const fmt = (iso: string) => new Date(iso).toLocaleString('pl-PL')

export function NewInvitation() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [invitation, setInvitation] = useState<HouseholdInvitation | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  async function send(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    setSubmitting(true)
    setCopied(false)
    try {
      setInvitation(await api.sendInvitation(String(form.get('email'))))
      setErrors({})
      formEl.reset()
    } catch (err) {
      setInvitation(null)
      setErrors(errorFields(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      // Brak dostępu do schowka (np. poza HTTPS) — użytkownik może skopiować link z pola ręcznie.
      setCopied(false)
    }
  }

  return (
    <Layout
      title="Zaproś użytkownika"
      subtitle="Wyślij zaproszenie do swojego gospodarstwa."
      actions={<Link className="btn btn-secondary" to="/invitations">Wysłane zaproszenia</Link>}
    >
      <form className="card form-inline" onSubmit={send}>
        <div className="field">
          <label htmlFor="email">Email użytkownika</label>
          <input id="email" name="email" type="email" placeholder="jan@example.com" required />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Wysyłanie…' : 'Wyślij zaproszenie'}
        </button>
        {errors.error && <div className="alert alert-error span-all">{errors.error}</div>}
      </form>

      {invitation && (
        <div className="card stack card-success">
          <p className="m-0">
            Zaproszenie dla <strong>{invitation.email}</strong> ważne do {fmt(invitation.expiresAt)}.
          </p>
          <label htmlFor="invitation-link">Wyślij tej osobie link:</label>
          <div className="copy-row">
            <input id="invitation-link" readOnly value={invitation.link} onFocus={e => e.target.select()} />
            <button className="btn btn-primary" type="button" onClick={() => copy(invitation.link)}>
              {copied ? 'Skopiowano ✓' : 'Kopiuj link'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
