import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { api, errorFields } from './api'
import type { InvitationPreview, RegisterData } from './api'
import { AuthLayout } from './Layout'
import { useSession } from './session'

export function Login() {
  const { signedIn } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  // RequireAuth zapisuje w state stronę, na którą użytkownik chciał wejść.
  const from = (location.state as { from?: string } | null)?.from ?? '/tasks'
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setSubmitting(true)
    try {
      await api.login(String(form.get('email')), String(form.get('password')))
      signedIn()
      navigate(from, { replace: true })
    } catch (err) {
      const fields = errorFields(err)
      // 401 z logowania oznacza złe dane, a nie wygasłą sesję.
      setError(fields.error && !fields.error.startsWith('Sesja') ? fields.error : 'Nieprawidłowy email lub hasło.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Witaj ponownie" subtitle="Zaloguj się, aby zobaczyć zadania gospodarstwa.">
      {error && <div className="alert alert-error">{error}</div>}
      <form className="card stack" onSubmit={submit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" name="email" autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="login-password">Hasło</label>
          <input id="login-password" type="password" name="password" autoComplete="current-password" required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Logowanie…' : 'Zaloguj'}
        </button>
      </form>
      <p className="auth-footer">Nie masz konta? <Link className="link" to="/register">Załóż konto</Link></p>
    </AuthLayout>
  )
}

type FieldName = Exclude<keyof RegisterData, 'invitationCode'>

const FIELDS: { name: FieldName; label: string; type: string; autoComplete: string }[] = [
  { name: 'firstName', label: 'Imię', type: 'text', autoComplete: 'given-name' },
  { name: 'lastName', label: 'Nazwisko', type: 'text', autoComplete: 'family-name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Hasło', type: 'password', autoComplete: 'new-password' },
  { name: 'householdName', label: 'Nazwa gospodarstwa', type: 'text', autoComplete: 'off' },
]

/** Rejestracja z linku /invite/:code. */
export function InvitationRegister() {
  const { code } = useParams()
  return <Register invitationCode={code ?? null} />
}

export function Register({ invitationCode = null }: { invitationCode?: string | null }) {
  const { signedIn } = useSession()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [invitationPreview, setInvitationPreview] = useState<InvitationPreview | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!invitationCode) return
    let cancelled = false

    api.invitation(invitationCode)
      .then(preview => {
        if (cancelled) return
        setInvitationPreview(preview)
        setErrors({})
      })
      .catch(err => {
        if (cancelled) return
        setInvitationPreview(null)
        setErrors(errorFields(err))
      })

    return () => { cancelled = true }
  }, [invitationCode])

  // Przy zaproszeniu email i gospodarstwo pochodzą z zaproszenia i nie można ich zmienić.
  const prefilled: Partial<Record<FieldName, string>> = invitationPreview
    ? { email: invitationPreview.email, householdName: invitationPreview.householdName }
    : {}

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(
      FIELDS.map(({ name }) => [name, String(form.get(name) ?? '')]),
    ) as Record<FieldName, string>
    const payload: RegisterData = invitationCode ? { ...data, invitationCode } : data

    setSubmitting(true)
    try {
      if (invitationCode) {
        await api.registerInvitation(payload)
      } else {
        await api.register(payload)
      }
      await api.login(payload.email, payload.password)
      signedIn()
      navigate('/tasks', { replace: true })
    } catch (err) {
      setErrors(errorFields(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Utwórz konto" subtitle={invitationCode ? 'Dołącz do gospodarstwa, do którego Cię zaproszono.' : 'Załóż gospodarstwo i zacznij planować razem.'}>
      {invitationPreview && (
        <div className="alert alert-info">
          Zaproszenie do gospodarstwa <strong>{invitationPreview.householdName}</strong> od{' '}
          <strong>{invitationPreview.invitedByFirstName}</strong>
        </div>
      )}
      {/* key: defaultValue działa tylko przy montowaniu, więc po wczytaniu zaproszenia budujemy formularz od nowa. */}
      <form className="card stack" onSubmit={submit} key={invitationPreview ? 'invitation' : 'empty'}>
        {FIELDS.map(({ name, label, type, autoComplete }) => (
          <div className="field" key={name}>
            <label htmlFor={`register-${name}`}>{label}</label>
            <input
              id={`register-${name}`}
              type={type}
              name={name}
              autoComplete={autoComplete}
              required
              minLength={name === 'password' ? 6 : undefined}
              readOnly={prefilled[name] !== undefined}
              defaultValue={prefilled[name] ?? ''}
            />
            {errors[name] && <div className="error">{errors[name]}</div>}
          </div>
        ))}
        {errors.error && <div className="alert alert-error">{errors.error}</div>}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Rejestrowanie…' : 'Zarejestruj'}
        </button>
      </form>
      <p className="auth-footer">Masz już konto? <Link className="link" to="/login">Zaloguj się</Link></p>
    </AuthLayout>
  )
}
