'use client'
import { useState } from 'react'
export default function Contact(){
  const [ok, setOk] = useState(false)
  async function onSubmit(e:any){
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    const res = await fetch('/api/email/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)})
    setOk(res.ok)
  }
  return (
    <div className="card">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div><label className="label">Email</label><input required name="email" type="email" className="input"/></div>
        <div><label className="label">Téléphone</label><input required name="phone" className="input"/></div>
        <div><label className="label">Message</label><textarea required name="message" className="input" rows={5}></textarea></div>
        <button className="btn">Envoyer</button>
      </form>
      {ok && <p className="mt-4 text-green-700">Message envoyé. Une copie a été transmise au service commercial.</p>}
    </div>
  )
}
