export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  startDate: string
  endDate: string
  createdAt: string
  assignedTo: string | null
  createdBy: string | null
}

export interface Member {
  id: number
  userId: number
  firstName: string
  lastName: string
  role: string
}

export interface CalendarEvent {
  id: number
  title: string
  start: string
  end: string
  status: TaskStatus
}

export interface NewTask {
  title: string
  description: string
  startDate: string
  endDate: string
  assignedUserId: number | null
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  householdName: string
}

/** Błąd API; `fields` zawiera komunikaty walidacji per pole, a `error` ogólny komunikat (HTTP 400). */
export class ApiError extends Error {
  constructor(public status: number, public fields: Record<string, string> = {}) {
    super(`HTTP ${status}`)
  }
}

function csrfToken(): string {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function request<T = void>(method: string, url: string, body?: BodyInit, json = false): Promise<T> {
  const headers: Record<string, string> = { 'X-XSRF-TOKEN': csrfToken() }
  if (json) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, { method, headers, body, credentials: 'same-origin' })
  if (!res.ok) {
    const fields = res.status === 400 ? await res.json().catch(() => ({})) : {}
    throw new ApiError(res.status, fields)
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

const jsonBody = (data: unknown) => JSON.stringify(data)

export const api = {
  me: () => request<{ email: string }>('GET', '/api/auth/me'),
  login: (email: string, password: string) =>
    request('POST', '/api/auth/login', new URLSearchParams({ username: email, password })),
  logout: () => request('POST', '/api/auth/logout'),
  register: (data: RegisterData) => request('POST', '/api/auth/register', jsonBody(data), true),

  tasks: () => request<Task[]>('GET', '/api/tasks'),
  addTask: (task: NewTask) => request('POST', '/api/tasks', jsonBody(task), true),
  toggleTask: (id: number) => request('POST', `/api/tasks/${id}/toggle`),
  deleteTask: (id: number) => request('DELETE', `/api/tasks/${id}`),

  members: () => request<Member[]>('GET', '/api/household-members'),
  events: (from: Date, to: Date) =>
    request<CalendarEvent[]>(
      'GET',
      `/api/calendar/events?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
    ),
}
