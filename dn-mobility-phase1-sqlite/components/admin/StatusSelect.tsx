'use client'

import { useState } from 'react'

type Status =
  | 'DRAFT'
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'DONE'
// On supprime CANCELLED du choix si tu veux l’enlever.

const OPTIONS: Array<{ value: Status; label: string }> = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'ASSIGNED', label: 'Assignée' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE', label: 'Terminée' },
]

export default function StatusSelect({
  missionId,
  value,
  onChanged,
}: {
  missionId: string
  value: Status
  onChanged?: (s: Status) => void
}) {
  const [local, setLocal] = useState<Status>(value)
  const [saving, setSaving] = useState(false)

  async function updateStatus(newVal: Status) {
    setLocal(newVal)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/missions/${missionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newVal }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Maj statut impossible')
      }
      onChanged?.(newVal)
    } catch (e: any) {
      alert(e?.message || 'Erreur mise à jour')
      setLocal(value) // rollback visuel
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      className="border rounded px-2 py-1 text-xs"
      value={local}
      disabled={saving}
      onChange={(e) => updateStatus(e.target.value as Status)}
    >
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
