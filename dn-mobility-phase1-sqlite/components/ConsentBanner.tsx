'use client'
import { useEffect, useState } from 'react'

export default function ConsentBanner(){
  const [visible,setVisible] = useState(false)
  useEffect(()=>{
    if (typeof window==='undefined') return
    if (!localStorage.getItem('cookie:analytics')) setVisible(true)
  }, [])
  if (!visible) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="max-w-6xl mx-auto m-4 card p-4 flex flex-col md:flex-row items-center gap-3">
        <p className="text-sm text-ink-700">Nous utilisons des cookies analytiques pour améliorer le service.</p>
        <div className="flex gap-2 ml-auto">
          <button className="btn" onClick={()=>{localStorage.setItem('cookie:analytics','granted'); location.reload()}}>Accepter</button>
          <button className="px-4 py-2 rounded-xl border" onClick={()=>{localStorage.setItem('cookie:analytics','denied'); setVisible(false)}}>Refuser</button>
        </div>
      </div>
    </div>
  )
}
