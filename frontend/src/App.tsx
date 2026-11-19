import { Navigate, Route, Routes } from 'react-router'
import { InvitationRegister, Login, Register } from './Auth'
import { CalendarView } from './CalendarView'
import { InvitationView } from './InvitationView'
import { NewInvitation } from './NewInvitation'
import { GuestOnly, RequireAuth } from './session'
import { TaskList } from './TaskList'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Link z zaproszenia generowany przez backend (InvitationResponse). */}
        <Route path="/invite/:code" element={<InvitationRegister />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/invitations" element={<InvitationView />} />
        <Route path="/invitations/new" element={<NewInvitation />} />
      </Route>

      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  )
}
