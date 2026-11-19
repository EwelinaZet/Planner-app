import { useCallback, useEffect, useState, type SubmitEvent } from 'react'
import { api, errorFields } from './api'
import type { Member, Task, TaskStatus } from './api'
import { Layout } from './Layout'

const STATUS_LABEL: Record<TaskStatus, string> = { TODO: 'Do zrobienia', IN_PROGRESS: 'W trakcie', DONE: 'Gotowe' }
const STATUS_CLASS: Record<TaskStatus, string> = {
  TODO: 'status-open',
  IN_PROGRESS: 'status-progress',
  DONE: 'status-done',
}

// Pole datetime-local zwraca czas lokalny bez strefy; backend oczekuje Instant (ISO, UTC).
const toInstant = (value: FormDataEntryValue | null) => (value ? new Date(String(value)).toISOString() : '')
const fmt = (iso: string) => new Date(iso).toLocaleString('pl-PL')

export function TaskList() {
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [listError, setListError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null)

  const load = useCallback(
    () => api.tasks().then(setTasks).catch(err => setListError(errorFields(err).error ?? 'Nie udało się pobrać zadań.')),
    [],
  )

  useEffect(() => {
    load()
    api.members()
      .then(setMembers)
      .catch(() => setListError('Nie udało się pobrać członków gospodarstwa.'))
  }, [load])

  async function add(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const assigned = form.get('assignedUserId')
    setSubmitting(true)
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
      setErrors(errorFields(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function runTaskAction(id: number, action: () => Promise<void>) {
    setBusyTaskId(id)
    setListError(null)
    try {
      await action()
      await load()
    } catch (err) {
      setListError(errorFields(err).error ?? 'Operacja nie powiodła się.')
    } finally {
      setBusyTaskId(null)
    }
  }

  const toggle = (t: Task) => runTaskAction(t.id, () => api.toggleTask(t.id))
  const remove = (t: Task) => {
    if (!window.confirm(`Usunąć zadanie „${t.title}”?`)) return
    runTaskAction(t.id, () => api.deleteTask(t.id))
  }

  return (
    <Layout title="Zadania" subtitle="Dodawaj zadania i śledź, kto czym się zajmuje.">
      <form className="card form-grid" onSubmit={add}>
        <h2 className="card-title span-all">Nowe zadanie</h2>
        <div className="field">
          <label htmlFor="title">Nazwa zadania</label>
          <input id="title" name="title" placeholder="Np. Zrobić zakupy" />
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
            <option value="">— Wybierz osobę —</option>
            {members.map(m => (
              <option key={m.id} value={m.userId}>{m.firstName} {m.lastName}</option>
            ))}
          </select>
          {errors.assignedUserId && <div className="error">{errors.assignedUserId}</div>}
        </div>
        <div className="form-submit">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Dodawanie…' : '+ Dodaj zadanie'}
          </button>
        </div>
        {errors.error && <div className="alert alert-error span-all">{errors.error}</div>}
      </form>

      {listError && <div className="alert alert-error">{listError}</div>}
      {tasks === null && !listError && <div className="empty">Wczytywanie…</div>}
      {tasks?.length === 0 && <div className="empty">Brak zadań — dodaj pierwsze powyżej.</div>}

      <div className="task-list">
        {tasks?.map(t => {
          const done = t.status === 'DONE'
          const busy = busyTaskId === t.id
          return (
            <article className={'task-card' + (done ? ' is-done' : '')} key={t.id}>
              <div className="task-info">
                <div className="task-head">
                  <span className={'task-title' + (done ? ' completed-text' : '')}>{t.title}</span>
                  <span className={'status ' + STATUS_CLASS[t.status]}>{STATUS_LABEL[t.status]}</span>
                </div>
                {t.description && (
                  <p className={'task-description' + (done ? ' completed-text' : '')}>{t.description}</p>
                )}
                <dl className="task-meta">
                  <div><dt>Osoba</dt><dd>{t.assignedTo ?? '—'}</dd></div>
                  <div><dt>Start</dt><dd>{fmt(t.startDate)}</dd></div>
                  <div><dt>Koniec</dt><dd>{fmt(t.endDate)}</dd></div>
                </dl>
                <div className="task-footnote">
                  Dodano {fmt(t.createdAt)}{t.createdBy && ` przez ${t.createdBy}`}
                </div>
              </div>
              <div className="task-actions">
                <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => toggle(t)}>Zmień status</button>
                <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => remove(t)}>Usuń</button>
              </div>
            </article>
          )
        })}
      </div>
    </Layout>
  )
}
