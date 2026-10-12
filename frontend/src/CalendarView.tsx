import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { api } from './api'

export function CalendarView({ onTasks, onLogout }: { onTasks: () => void; onLogout: () => void }) {
  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>Kalendarz wydarzeń</h1>
          <button className="link" onClick={onTasks}>← Lista zadań</button>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>Wyloguj</button>
      </div>
      <div className="card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          locale="pl"
          firstDay={1}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={(info, success, failure) => { api.events(info.start, info.end)
          .then(events => success(events.map(e => ({ ...e, id: String(e.id) }))), failure) }}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
      </div>
    </div>
  )
}
