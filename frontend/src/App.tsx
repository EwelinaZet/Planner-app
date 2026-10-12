import { useEffect, useState } from 'react'
import { api } from './api'
import { Login, Register } from './Auth'
import { CalendarView } from './CalendarView'
import { TaskList } from './TaskList'

type View = 'loading' | 'login' | 'register' | 'tasks' | 'calendar'

export default function App() {
  const [view, setView] = useState<View>('loading')

  useEffect(() => {
    api.me().then(() => setView('tasks')).catch(() => setView('login'))
  }, [])

  if (view === 'loading') return null
  if (view === 'login') return <Login onSuccess={() => setView('tasks')} onRegister={() => setView('register')} />
  if (view === 'register') return <Register onDone={() => setView('login')} onLogin={() => setView('login')} />

  const logout = () => api.logout().finally(() => setView('login'))
  return view === 'calendar'
    ? <CalendarView onTasks={() => setView('tasks')} onLogout={logout} />
    : <TaskList onCalendar={() => setView('calendar')} onLogout={logout} />
}
