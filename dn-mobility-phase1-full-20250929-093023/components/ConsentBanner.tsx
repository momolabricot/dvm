'use client'
import { useEffect, useState } from 'react'
export default function ConsentBanner(){
  const [visible, setVisible] = useState(false)
  useEffect(()=>{ setVisible(localStorage.getItem('consent')!=='yes') },[])
  if(!visible) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-2xl p-4 max-w-xl w-[90%] z-50">
      <p className="text-sm">Nous utilisons des cookies de mesure d’audience (Google Analytics / Matomo) après votre consentement.</p>
      <div className="mt-3 flex gap-3 justify-end">
        <button className="btn" onClick={()=>{localStorage.setItem('consent','yes'); location.reload()}}>J’accepte</button>
        <button className="input" onClick={()=>{localStorage.setItem('consent','no'); setVisible(false)}}>Refuser</button>
      </div>
    </div>
  )
}
