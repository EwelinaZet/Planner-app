import { useEffect, useState } from 'react'
import { api } from './api'
import { Login, Register } from './Auth'
import { CalendarView } from './CalendarView'
import { InvitationView } from './InvitationView'
import { NewInvitation } from './NewInvitation'
import { TaskList } from './TaskList'

type View = 'loading' | 'login' | 'register' | 'tasks' | 'calendar' | 'invitation' | 'invite'

const inviteCode = window.location.pathname.match(/^\/invite\/([^/]+)/)?.[1] ?? null 

export default function App() {
  const [view, setView] = useState<View>('loading')

  useEffect(() => {
    api.me().then(() => setView('tasks')).catch(() => setView(inviteCode ? 'register' : 'login'))
  }, [])

  if (view === 'loading') return null
  const toLogin = () => {
    if (inviteCode) window.history.replaceState(null, '', '/')
    setView('login')
  }
  if (view === 'login') return <Login onSuccess={() => setView('tasks')} onRegister={() => setView('register')} />
  if (view === 'register') return <Register inviteCode={inviteCode} onDone={toLogin} onLogin={toLogin} />

  const logout = () => api.logout().finally(() => setView('login'))
  return view === 'calendar'
    ? <CalendarView onTasks={() => setView('tasks')} onLogout={logout} />
    : view === 'invitation'
    ? <InvitationView onTasks={() => setView('invitation')} onLogout={logout} />
    : view === 'invite'
    ? <NewInvitation onTasks={() => setView('invite')} onLogout={logout} />
    : <TaskList onCalendar={() => setView('calendar')} onInvitation={() => setView('invitation')} onInvite={() => setView('invite')}  onLogout={logout} />
}
