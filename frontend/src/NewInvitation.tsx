import { FormEvent, useState } from 'react'
import { api, ApiError } from './api'
import type { Invitation } from './api'

const fmt = (iso: string) => new Date(iso).toLocaleString('pl-PL')

export function NewInvitation({ onTasks, onLogout }: { onTasks: () => void; onLogout: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [invitation, setInvitation] = useState<Invitation | null>(null)

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    try {
      setInvitation(await api.sendInvitation(String(form.get('email'))))
      setErrors({})
      formEl.reset()
    } catch (err) {
      setInvitation(null)
      setErrors(err instanceof ApiError ? err.fields : {})
    }
  }

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>Zaproś użytkownika</h1>
          <p>Wyślij zaproszenie do swojego household.</p>
          <button className="link" onClick={onTasks}>← Lista zadań</button>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>Wyloguj</button>
      </div>

      <form className="card form-grid" onSubmit={send}>
        <div className="field">
          <label htmlFor="email">Email użytkownika</label>
          <input id="email" name="email" type="email" placeholder="test@gmail.com" />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>
        <button className="btn btn-primary" type="submit">Wyślij zaproszenie</button>
        {errors.error && <div className="error">{errors.error}</div>}
      </form>

      {invitation && (
        <div className="card">
          <p>Zaproszenie dla <strong>{invitation.email}</strong> ważne do {fmt(invitation.expiresAt)}.</p>
          <p>Wyślij tej osobie link:</p>
          <input readOnly value={invitation.link} onFocus={e => e.target.select()} />
          <button className="btn btn-success" onClick={() => navigator.clipboard.writeText(invitation.link)}>
            Kopiuj link
          </button>
        </div>
      )}
    </div>
  )
}
