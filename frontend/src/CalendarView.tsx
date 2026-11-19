import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { api } from './api'
import { Layout } from './Layout'

export function CalendarView() {
  return (
    <Layout title="Kalendarz" subtitle="Zadania gospodarstwa w widoku miesiąca, tygodnia lub dnia.">
      <div className="card calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          locale="pl"
          firstDay={1}
          height="auto"
          buttonText={{ today: 'Dziś', month: 'Miesiąc', week: 'Tydzień', day: 'Dzień' }}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={(info, success, failure) => {
            api.events(info.start, info.end)
              .then(events => success(events.map(e => ({ ...e, id: String(e.id) }))))
              .catch(failure)
          }}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
      </div>
    </Layout>
  )
}
