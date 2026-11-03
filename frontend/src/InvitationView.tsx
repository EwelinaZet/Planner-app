import { api, ApiError, type Invitation } from './api'
import { FormEvent, useCallback, useEffect, useState } from 'react'

export function InvitationView({ onTasks, onLogout }: { onTasks: () => void; onLogout: () => void }) {
  const code="abs"
  const [invitation, setInvitation] =  useState<Invitation>(null)

  useEffect(() => {
    api.invitation(code).then(setInvitation)
  })

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
        {invitation?.invitedByFirstName} invited you to {invitation.householdName}
      </div>
    </div>
  )
}
