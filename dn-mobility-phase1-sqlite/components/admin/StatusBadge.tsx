import React from 'react'

type Status =
  | 'DRAFT'
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'CANCELLED'

const LABELS: Record<Status, string> = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  ASSIGNED: 'Assignée',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminée',
  CANCELLED: 'Annulée',
}

const COLORS: Record<Status, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  DONE: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function StatusBadge({ status }: { status: Status }) {
  const s = (status as Status) || 'DRAFT'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${COLORS[s]}`}>
      {LABELS[s]}
    </span>
  )
}
