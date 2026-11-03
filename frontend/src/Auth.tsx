import { FormEvent, useEffect, useState } from 'react'
import { api, ApiError } from './api'
import type { RegisterData, InvitationPreview } from './api '

export function Login({ onSuccess, onRegister }: { onSuccess: () => void; onRegister: () => void }) {
  const [error, setError] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await api.login(String(form.get('email')), String(form.get('password')))
      onSuccess()
    } catch {
      setError(true)
    }
  }

  return (
    <div className="page narrow">
      <h1>Logowanie</h1>
      {error && <div className="error">Nieprawidłowy email lub hasło.</div>}
      <form className="card stack" onSubmit={submit}>
        <div className="field"><label>Email</label><input type="email" name="email" required /></div>
        <div className="field"><label>Hasło</label><input type="password" name="password" required /></div>
        <button className="btn btn-primary" type="submit">Zaloguj</button>
      </form>
      <button className="link" onClick={onRegister}>Załóż konto</button>
    </div>
  )
}

const FIELDS: [keyof RegisterData, string, string][] = [
  ['firstName', 'Imię', 'text'],
  ['lastName', 'Nazwisko', 'text'],
  ['email', 'Email', 'email'],
  ['password', 'Hasło', 'password'],
  ['householdName', 'Nazwa gospodarstwa', 'text'],
]

export function Register({ inviteCode, onDone, onLogin }: { inviteCode: string | null; onDone: () => void; onLogin: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [invitationPreview, setInvitationPreview] = useState<InvitationPreview | null>(null)
  
  // const visibleFields = inviteCode ? FIELDS.filter(([name]) => name !== 'householdName') : FIELDS
  const visibleFields = FIELDS

  useEffect(()=> {
    const fetchData = async () => {
      try {
        setInvitationPreview(await api.invitation(inviteCode))
        setErrors({})
      } catch (err) {
        setInvitationPreview(null)
        setErrors(err instanceof ApiError ? err.fields : {})
      }
    }
    if(inviteCode) {
      fetchData()
    }
  })

  async function submit(e: FormEvent<HTMLFormElement>) {
    console.log('test')
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(visibleFields.map(([name]) => [name, String(form.get(name))])) as unknown as RegisterData
    console.log('data', data)
    if (inviteCode) data.inviteCode = inviteCode
    try {
      if(inviteCode) {
        console.log('registerInvitation', data)
        await api.registerInvitation(data)
      } else {
        await api.register(data)
      }
      onDone()
    } catch (err) {
      setErrors(err instanceof ApiError ? err.fields : {})
    }
  }

  return (
    <div className="page narrow">
      <h1>Rejestracja</h1>
      {invitationPreview && (
        <div>Zaproszenie do gospodarstwa {invitationPreview.householdName} od {invitationPreview.invitedByFirstName}</div>
      )}
      { visibleFields["email"]}
      <form className="card stack" onSubmit={submit}>
        {visibleFields.map(([name, label, type]) => (
          <div className="field" key={name}>
            <label>{label}</label>
            <input
              type={type}
              name={name}
              readOnly={name === "email" && Boolean(invitationPreview?.email)}
              defaultValue={
                name === "email"
                  ? invitationPreview?.email ?? ""
                  : name === "householdName"
                    ? invitationPreview?.householdName ?? ""
                    : ""
              }
              />
            {errors[name] && <div className="error">{errors[name]}</div>}
          </div>
        ))}
        {errors.error && <div className="error">{errors.error}</div>}
        <button className="btn btn-primary" type="submit">Zarejestruj</button>
      </form>
      <button className="link" onClick={onLogin}>Mam już konto</button>
    </div>
  )
}
