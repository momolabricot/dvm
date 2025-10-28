'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type MissionRow = {
  id: string
  date: string // ISO
  km: number
  ratePerKm: number | null
  amount: number
  clientPriceTCC?: never // legacy guard
  clientPriceTTC: number | null
  status: string
}

type PayoutRow = {
  convoyeurId: string
  convoyeurName: string | null
  convoyeurEmail: string | null
  ratePerKm: number | null
  totalKm: number
  totalAmount: number
  missions: MissionRow[]
}

type ApiResponse = {
  window: { from: string | null; to: string | null; all: boolean }
  debug?: { countMissions: number }
  count: number
  rows: PayoutRow[]
  totals: { km: number; amount: number }
}

type ConvoyeurOption = {
  id: string
  name: string | null
  email: string | null
  ratePerKm: number | null
}

function fmtMoney(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}
function fmtKm(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km'
}
function ymToday() {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}
const displayName = (c: ConvoyeurOption) =>
  (c.name ?? '').trim() || (c.email ?? '').trim() || '(sans nom)'

export default function AdminPricingPage() {
  // Filtres
  const [from, setFrom] = useState<string>(ymToday())
  const [to, setTo] = useState<string>(ymToday())
  const [convoyeurId, setConvoyeurId] = useState<string>('')
  const [convoyeurLabel, setConvoyeurLabel] = useState<string>('')
  const [all, setAll] = useState(false)

  // Autocomplete
  const [q, setQ] = useState<string>('')
  const [opts, setOpts] = useState<ConvoyeurOption[]>([])
  const [openOpts, setOpenOpts] = useState(false)
  const [loadingOpts, setLoadingOpts] = useState(false)
  const acRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number | undefined>(undefined)

  // Données tableau
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openConv, setOpenConv] = useState<Record<string, boolean>>({})

  const missionTotalCount = useMemo(
    () => (data?.rows || []).reduce((s, r) => s + r.missions.length, 0),
    [data]
  )

  // Click-outside pour l’autocomplete
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!acRef.current) return
      if (acRef.current.contains(e.target as Node)) return
      setOpenOpts(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Autocomplete (filtre réel)
  useEffect(() => {
    if (convoyeurId) return
    if (debounceRef.current) window.clearTimeout(debounceRef.current)

    debounceRef.current = window.setTimeout(async () => {
      const term = q.trim()
      if (!term) {
        setOpts([])
        setOpenOpts(false)
        return
      }
      try {
        setLoadingOpts(true)
        const params = new URLSearchParams()
        params.set('q', term)
        params.set('active', '1')
        params.set('limit', '50') // on récupère large puis on coupe à 10

        const res = await fetch(`/api/admin/convoyeurs?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const raw = await res.json()
        const rows: any[] = Array.isArray(raw?.rows) ? raw.rows : []

        // Aplatir user.name / user.email -> name / email
        const flattened: ConvoyeurOption[] = rows.map((r) => ({
          id: r?.id,
          name: (r?.user?.name ?? '')?.trim() || null,
          email: (r?.user?.email ?? '')?.trim() || null,
          ratePerKm: typeof r?.ratePerKm === 'number' ? r.ratePerKm : null,
        }))

        // Filtre local insensible à la casse + limite 10
        const termLC = term.toLowerCase()
        const filtered = flattened.filter((c) => {
          const n = (c.name ?? '').toLowerCase()
          const m = (c.email ?? '').toLowerCase()
          return n.includes(termLC) || m.includes(termLC)
        })

        setOpts(filtered.slice(0, 10))
        setOpenOpts(filtered.length > 0)
      } catch {
        setOpts([])
        setOpenOpts(false)
      } finally {
        setLoadingOpts(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [q, convoyeurId])

  // Charger le tableau payouts
  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      setData(null)
      try {
        const params = new URLSearchParams()
        if (!all) {
          if (from) params.set('from', from)
          if (to) params.set('to', to)
        } else {
          params.set('all', '1')
        }
        if (convoyeurId) params.set('convoyeurId', convoyeurId)

        const res = await fetch(`/api/admin/payouts?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(`Erreur ${res.status} – ${txt}`)
        }
        const j = (await res.json()) as ApiResponse
        setData(j)
      } catch (e: any) {
        setError(e?.message || 'Erreur de chargement.')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [from, to, convoyeurId, all])

  const windowLabel = useMemo(() => {
    if (all) return 'Toutes les périodes'
    const f = from || '—'
    const t = to || '—'
    return f === t ? f : `${f} → ${t}`
  }, [from, to, all])

  function onSelectConv(c: ConvoyeurOption) {
    setConvoyeurId(c.id)
    setConvoyeurLabel([displayName(c), c.email || ''].filter(Boolean).join(' – '))
    setQ('')
    setOpts([])
    setOpenOpts(false)
    inputRef.current?.blur()
  }
  function onClearConv() {
    setConvoyeurId('')
    setConvoyeurLabel('')
    setQ('')
    setOpts([])
    setOpenOpts(false)
    inputRef.current?.focus()
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {/* Titre + actions (violet) */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarifs & Paiements convoyeurs</h1>
          <p className="text-sm text-gray-600">Vue mensuelle des kilomètres et montants à payer.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center rounded-md border border-violet-200 bg-white px-3 py-2 text-sm hover:bg-violet-50"
          >
            ← Retour
          </Link>
          <button
            onClick={() => {
              // force refresh sans toucher aux filtres
              const p = new URLSearchParams()
              if (!all) { if (from) p.set('from', from); if (to) p.set('to', to) } else { p.set('all', '1') }
              if (convoyeurId) p.set('convoyeurId', convoyeurId)
              fetch(`/api/admin/payouts?${p.toString()}`, { cache: 'no-store' })
                .then(r => r.json())
                .then((j: ApiResponse) => setData(j))
                .catch(() => {})
            }}
            className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700"
          >
            Actualiser
          </button>
        </div>
      </header>

      {/* Filtres (cartes violettes) */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mois début</label>
            <input
              type="month"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500 px-3 py-2"
              disabled={all}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mois fin</label>
            <input
              type="month"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500 px-3 py-2"
              disabled={all}
            />
          </div>

          {/* Autocomplete */}
          <div ref={acRef} className="relative">
            <label className="block text-sm font-medium text-gray-700">Convoyeur</label>

            {!convoyeurId ? (
              <>
                <input
                  ref={inputRef}
                  placeholder="Tape un nom ou un email…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setOpenOpts(!!opts.length)}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500 px-3 py-2"
                  autoComplete="off"
                />
                {openOpts && (
                  <div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg max-h-64 overflow-auto">
                    {loadingOpts && (
                      <div className="px-3 py-2 text-sm text-gray-500">Recherche…</div>
                    )}
                    {!loadingOpts && opts.length === 0 && q.trim() !== '' && (
                      <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
                    )}
                    {!loadingOpts &&
                      opts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectConv(c)}
                          className="block w-full text-left px-3 py-2 hover:bg-violet-50"
                        >
                          <div className="font-medium text-gray-900">
                            {displayName(c)}
                          </div>
                          <div className="text-xs text-gray-500">{c.email || '—'}</div>
                        </button>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm text-violet-900">
                  {convoyeurLabel || 'Convoyeur sélectionné'}
                </span>
                <button
                  type="button"
                  onClick={onClearConv}
                  className="rounded-md border border-violet-200 px-2 py-1 text-xs hover:bg-violet-50"
                  aria-label="Effacer le filtre convoyeur"
                >
                  Effacer
                </button>
              </div>
            )}

            <p className="mt-1 text-xs text-gray-500">
              Laisse vide pour tous les convoyeurs.
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              id="all"
              type="checkbox"
              className="h-4 w-4 text-violet-600 focus:ring-violet-500"
              checked={all}
              onChange={(e) => setAll(e.target.checked)}
            />
            <span className="text-sm">Ignorer la fenêtre de dates (debug)</span>
          </label>
        </div>
      </section>

      {/* Bandeau d’infos (violet soft) */}
      <section className="rounded-xl border border-violet-200 bg-violet-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Info small="Fenêtre" value={windowLabel} />
          <Info small="Convoyeurs" value={String(data?.count ?? 0)} />
          <Info small="Missions (total)" value={String(missionTotalCount)} />
          <Info small="Total KM" value={fmtKm(data?.totals.km ?? 0)} />
          <Info small="Total à payer" value={fmtMoney(data?.totals.amount ?? 0)} />
        </div>
        {data?.debug && (
          <div className="mt-2 text-xs text-violet-900/70">
            Debug: missions brutes renvoyées par l’API = {data.debug.countMissions}
          </div>
        )}
      </section>

      {/* États */}
      {loading && <p className="text-sm text-gray-600">Chargement…</p>}
      {error && <p className="text-sm text-rose-700">{error}</p>}

      {/* Tableau principal (entête violette) */}
      {!loading && !error && (
        <section className="rounded-xl border border-gray-200 bg-white overflow-x-auto shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-50/60">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold text-gray-700">Convoyeur</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Email</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Missions</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Taux (€/km)</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">KM total</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Montant</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(data?.rows ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                    Aucune donnée pour ces filtres.
                  </td>
                </tr>
              )}

              {(data?.rows ?? []).map((r) => {
                const open = !!openConv[r.convoyeurId]
                return (
                  <FragmentRow
                    key={r.convoyeurId}
                    row={r}
                    open={open}
                    toggle={() => setOpenConv((prev) => ({ ...prev, [r.convoyeurId]: !prev[r.convoyeurId] }))}
                  />
                )
              })}
            </tbody>

            {data && data.rows.length > 0 && (
              <tfoot className="bg-violet-50/60">
                <tr>
                  <td className="px-3 py-2 font-medium" colSpan={4}>
                    Totaux
                  </td>
                  <td className="px-3 py-2 text-right font-medium">{fmtKm(data.totals.km)}</td>
                  <td className="px-3 py-2 text-right font-medium">{fmtMoney(data.totals.amount)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </section>
      )}
    </main>
  )
}

function Info({ small, value }: { small: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-violet-900/70">{small}</div>
      <div className="font-medium text-violet-900">{value}</div>
    </div>
  )
}

function FragmentRow({
  row,
  open,
  toggle,
}: {
  row: PayoutRow
  open: boolean
  toggle: () => void
}) {
  const missionsCount = row.missions.length
  return (
    <>
      <tr className="border-t">
        <td className="px-3 py-2">
          <div className="font-medium text-gray-900">{row.convoyeurName ?? '(sans nom)'}</div>
          <div className="text-xs text-gray-500">ID: {row.convoyeurId}</div>
        </td>
        <td className="px-3 py-2">
          {row.convoyeurEmail ? (
            <a className="underline" href={`mailto:${row.convoyeurEmail}`}>
              {row.convoyeurEmail}
            </a>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-3 py-2 text-right">{missionsCount}</td>
        <td className="px-3 py-2 text-right">
          {row.ratePerKm != null
            ? row.ratePerKm.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'
            : '—'}
        </td>
        <td className="px-3 py-2 text-right">{fmtKm(row.totalKm)}</td>
        <td className="px-3 py-2 text-right">{fmtMoney(row.totalAmount)}</td>
        <td className="px-3 py-2 text-right">
          <button
            type="button"
            onClick={toggle}
            className="rounded-md border border-violet-200 px-2 py-1 text-xs hover:bg-violet-50"
          >
            {open ? 'Masquer' : 'Détails'}
          </button>
        </td>
      </tr>

      {open && row.missions.length > 0 && (
        <tr className="bg-violet-50/40">
          <td colSpan={7} className="px-3 py-3">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="px-2 py-1 font-medium">Date</th>
                    <th className="px-2 py-1 font-medium">Mission</th>
                    <th className="px-2 py-1 text-right font-medium">KM</th>
                    <th className="px-2 py-1 text-right font-medium">Taux</th>
                    <th className="px-2 py-1 text-right font-medium">Montant</th>
                    <th className="px-2 py-1 text-right font-medium">Prix client TTC</th>
                    <th className="px-2 py-1 text-right font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {row.missions.map((m) => {
                    const d = new Date(m.date)
                    const dateLabel = d.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                    return (
                      <tr key={m.id} className="border-t">
                        <td className="px-2 py-1">{dateLabel}</td>
                        <td className="px-2 py-1">
                          <Link className="underline" href={`/admin/missions?id=${m.id}`}>
                            {m.id.slice(0, 10)}…
                          </Link>
                        </td>
                        <td className="px-2 py-1 text-right">{fmtKm(m.km)}</td>
                        <td className="px-2 py-1 text-right">
                          {m.ratePerKm != null
                            ? m.ratePerKm.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'
                            : '—'}
                        </td>
                        <td className="px-2 py-1 text-right">{fmtMoney(m.amount)}</td>
                        <td className="px-2 py-1 text-right">{fmtMoney(m.clientPriceTTC)}</td>
                        <td className="px-2 py-1 text-right">{m.status}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
