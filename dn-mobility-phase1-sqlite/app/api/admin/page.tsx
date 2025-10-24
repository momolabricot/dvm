// app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'

type Quote = {
  id: string; quoteNo: string; status: 'PENDING'|'SENT'|'VIEWED'|'ACCEPTED'|'REJECTED'
  priceTTC: number; createdAt: string
}
export default function AdminDashboard() {
  const [items, setItems] = useState<Quote[]>([])
  useEffect(() => {
    fetch('/api/admin/quotes?all=1').then(r=>r.json()).then(d=>setItems(d.items||[]))
  }, [])
  const total = items.length
  const accepted = items.filter(i=>i.status==='ACCEPTED')
  const rejected = items.filter(i=>i.status==='REJECTED')
  const ca = accepted.reduce((s,i)=>s+i.priceTTC,0)
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Devis total" value={total.toString()} />
      <Card title="Acceptés" value={accepted.length.toString()} />
      <Card title="Rejetés" value={rejected.length.toString()} />
      <Card title="CA estimé" value={ca.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})} />
    </div>
  )
}
function Card({title,value}:{title:string;value:string}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}
