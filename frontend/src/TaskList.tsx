import { FormEvent, useCallback, useEffect, useState } from 'react'
import { api, ApiError } from './api'
import type { Member, Task } from './api'

const STATUS_LABEL = { TODO: 'Do zrobienia', IN_PROGRESS: 'W trakcie', DONE: 'Gotowe' }

// Pole datetime-local zwraca czas lokalny bez strefy; backend oczekuje Instant (ISO, UTC).
const toInstant = (value: FormDataEntryValue | null) => (value ? new Date(String(value)).toISOString() : '')
const fmt = (iso: string) => new Date(iso).toLocaleString('pl-PL')

export function TaskList({ onCalendar, onLogout }: { onCalendar: () => void; onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const load = useCallback(() => api.tasks().then(setTasks), [])
  useEffect(() => {
    load()
    api.members().then(setMembers)
  }, [load])

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const assigned = form.get('assignedUserId')
    try {
      await api.addTask({
        title: String(form.get('title')),
        description: String(form.get('description')),
        startDate: toInstant(form.get('startDate')),
        endDate: toInstant(form.get('endDate')),
        assignedUserId: assigned ? Number(assigned) : null,
      })
      setErrors({})
      formEl.reset()
      await load()
    } catch (err) {
      setErrors(err instanceof ApiError ? err.fields : {})
    }
  }

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>Lista zadań</h1>
          <p>Dodawaj i zarządzaj zadaniami.</p>
          <button className="link" onClick={onCalendar}>Kalendarz →</button>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>Wyloguj</button>
      </div>

      <form className="card form-grid" onSubmit={add}>
        <div className="field">
          <label htmlFor="title">Nazwa zadania</label>
          <input id="title" name="title" placeholder="Np. Przygotować demo" />
          {errors.title && <div className="error">{errors.title}</div>}
        </div>
        <div className="field">
          <label htmlFor="description">Opis</label>
          <input id="description" name="description" placeholder="Krótki opis" />
          {errors.description && <div className="error">{errors.description}</div>}
        </div>
        <div className="field">
          <label htmlFor="startDate">Data rozpoczęcia</label>
          <input id="startDate" name="startDate" type="datetime-local" />
          {errors.startDate && <div className="error">{errors.startDate}</div>}
        </div>
        <div className="field">
          <label htmlFor="endDate">Data zakończenia</label>
          <input id="endDate" name="endDate" type="datetime-local" />
          {errors.endDate && <div className="error">{errors.endDate}</div>}
        </div>
        <div className="field">
          <label htmlFor="assignedUserId">Przypisz do</label>
          <select id="assignedUserId" name="assignedUserId" defaultValue="">
            <option value="">-- Wybierz członka --</option>
            {members.map(m => (
              <option key={m.id} value={m.userId}>{m.firstName} {m.lastName}</option>
            ))}
          </select>
          {errors.assignedUserId && <div className="error">{errors.assignedUserId}</div>}
        </div>
        <button className="btn btn-primary" type="submit">Dodaj</button>
        {errors.error && <div className="error">{errors.error}</div>}
      </form>

      {tasks.length === 0 && <div className="empty">Brak zadań.</div>}
      <div className="task-list">
        {tasks.map(t => (
          <div className="task-card" key={t.id}>
            <div className="task-info">
              <div>
                <span className={'task-title' + (t.status === 'DONE' ? ' completed-text' : '')}>{t.title}</span>
                <span className={'status ' + (t.status === 'DONE' ? 'status-done' : 'status-open')}>
                  {STATUS_LABEL[t.status]}
                </span>
              </div>
              <div className={'task-description' + (t.status === 'DONE' ? ' completed-text' : '')}>{t.description}</div>
              <div className="task-meta">
                <div>Osoba: {t.assignedTo ?? '—'}</div>
                <div>Rozpoczęcie: {fmt(t.startDate)}</div>
                <div>Zakończenie: {fmt(t.endDate)}</div>
                <div>Dodano: {fmt(t.createdAt)}{t.createdBy && ` przez ${t.createdBy}`}</div>
              </div>
            </div>
            <div className="task-actions">
              <button className="btn btn-success" onClick={() => api.toggleTask(t.id).then(load)}>Zmień status</button>
              <button className="btn btn-danger" onClick={() => api.deleteTask(t.id).then(load)}>Usuń</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
