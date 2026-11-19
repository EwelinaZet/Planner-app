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
  role: 'OWNER' | 'MEMBER'
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
  invitationCode?: string
}

/** Odpowiada InvitationResponse z backendu. */
export interface HouseholdInvitation {
  id: number
  email: string
  status: 'PENDING' | 'ACCEPTED'
  link: string
  expiresAt: string
}

/** Odpowiada InvitationPreviewResponse z backendu. */
export interface InvitationPreview {
  householdName: string
  invitedByFirstName: string
  email: string
  expiresAt: string
}

/**
 * Błąd API; `fields` zawiera komunikaty walidacji per pole, a `error` ogólny komunikat.
 * Dla błędów innych niż 400 `fields.error` dostaje komunikat zastępczy, żeby UI zawsze miało co pokazać.
 */
export class ApiError extends Error {
  status: number
  fields: Record<string, string>

  constructor(status: number, fields: Record<string, string> = {}) {
    super(`HTTP ${status}`)
    this.status = status
    this.fields = fields
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  401: 'Sesja wygasła. Zaloguj się ponownie.',
  403: 'Brak uprawnień do tej operacji.',
  404: 'Nie znaleziono zasobu.',
}

/** Wywoływane, gdy serwer zwróci 401 (np. wygasła sesja) — App przełącza wtedy na ekran logowania. */
let unauthorizedHandler: (() => void) | null = null
export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

function csrfToken(): string {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function request<T = void>(method: string, url: string, body?: BodyInit, json = false): Promise<T> {
  const headers: Record<string, string> = { 'X-XSRF-TOKEN': csrfToken() }
  if (json) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(url, { method, headers, body, credentials: 'same-origin' })
  } catch {
    throw new ApiError(0, { error: 'Brak połączenia z serwerem.' })
  }

  if (!res.ok) {
    if (res.status === 400) {
      throw new ApiError(400, await res.json().catch(() => ({ error: 'Nieprawidłowe dane.' })))
    }
    if (res.status === 401 && unauthorizedHandler) unauthorizedHandler()
    throw new ApiError(res.status, {
      error: FALLBACK_MESSAGES[res.status] ?? 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
    })
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

const jsonBody = (data: unknown) => JSON.stringify(data)

/** Wyciąga komunikaty błędów z dowolnego wyjątku, żeby komponenty nie musiały tego powtarzać. */
export function errorFields(err: unknown): Record<string, string> {
  return err instanceof ApiError ? err.fields : { error: 'Wystąpił nieoczekiwany błąd.' }
}

export const api = {
  me: () => request<{ email: string }>('GET', '/api/auth/me'),
  login: (email: string, password: string) =>
    request('POST', '/api/auth/login', new URLSearchParams({ username: email, password })),
  logout: () => request('POST', '/api/auth/logout'),
  register: (data: RegisterData) => request('POST', '/api/auth/register', jsonBody(data), true),
  registerInvitation: (data: RegisterData) =>
    request('POST', '/api/auth/register-invitation', jsonBody(data), true),

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

  invitation: (code: string) =>
    request<InvitationPreview>('GET', `/api/invitations/${encodeURIComponent(code)}`),
  invitations: () => request<HouseholdInvitation[]>('GET', '/api/household-invitation'),
  sendInvitation: (email: string) =>
    request<HouseholdInvitation>('POST', '/api/household-invitation', jsonBody({ email }), true),
}
