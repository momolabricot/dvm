// app/contact/page.tsx
'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setOk(null); setErr(null)

    // ✅ capture la référence AVANT tout await
    const form = e.currentTarget

    try {
      const fd = new FormData(form)
      const payload = Object.fromEntries(fd.entries())

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // Essaye de parser proprement (si pas de body JSON en erreur)
      let j: any = null
      try { j = await res.json() } catch { /* no-op */ }

      if (!res.ok) {
        throw new Error(j?.error || 'Erreur d’envoi')
      }

      setOk('Merci ! Votre message a bien été envoyé.')
      form.reset() // ✅ form n’est pas null ici
    } catch (e: any) {
      setErr(e?.message || 'Impossible d’envoyer le message pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Contact</h1>
          <p className="mt-2 text-gray-600">
            Une question, un besoin récurrent, un transfert urgent ? Écrivez-nous.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Prénom *</label>
                  <input name="prenom" required className="mt-1 w-full rounded-xl border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Nom *</label>
                  <input name="nom" required className="mt-1 w-full rounded-xl border px-3 py-2" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Email *</label>
                  <input type="email" name="email" required className="mt-1 w-full rounded-xl border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Téléphone *</label>
                  <input type="tel" name="telephone" required className="mt-1 w-full rounded-xl border px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Objet *</label>
                <input name="objet" required className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Sujet de votre demande" />
              </div>

              <div>
                <label className="block text-sm font-medium">Message *</label>
                <textarea name="message" required rows={6} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Décrivez votre besoin…" />
              </div>

              <div className="flex items-start gap-2">
                <input id="c-consent" name="consent" type="checkbox" value="1" required className="mt-1" />
                <label htmlFor="c-consent" className="text-sm text-gray-700">
                  J’accepte les <a className="underline" href="/donnees-personnelles" target="_blank" rel="noopener">Conditions d’utilisation des données</a>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-medium shadow hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? 'Envoi…' : 'Envoyer'}
              </button>

              {ok && <p className="text-green-700">{ok}</p>}
              {err && <p className="text-red-700">{err}</p>}
            </form>
          </div>

          <aside className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Coordonnées</h3>
            <p className="mt-2 text-gray-700">
              DN Mobility<br />France
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Email : <a className="underline" href="mailto:contact@dn-mobility.fr">contact@dn-mobility.fr</a><br />
              Tel : <a className="underline" href="tel:+33...">+33 …</a>
            </p>
            <div className="mt-6 rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
              Réponse sous 24h ouvrées. Pour l’urgence, indiquez-le dans l’objet.
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
