// app/a-propos/page.tsx
export const metadata = {
  title: "À propos | DN Mobility",
  description:
    "Qui sommes-nous ? Notre mission : rendre le convoyage et le transport de véhicules simple, fiable et transparent.",
}

const values = [
  {
    title: "Fiabilité",
    desc: "Livrer à l’heure et tenir nos engagements, c’est la base.",
  },
  {
    title: "Transparence",
    desc: "Un prix clair, un devis propre et une communication fluide.",
  },
  {
    title: "Simplicité",
    desc: "Des démarches légères, une équipe accessible, un suivi limpide.",
  },
]

export default function AProposPage() {
  return (
    <main className="bg-white">
      <section className="border-b bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            À propos de DN Mobility
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed">
            DN Mobility est née d’un constat simple : déplacer un véhicule devrait être
            aussi facile que réserver un trajet. Notre équipe combine expertise terrain,
            outils modernes et un vrai sens du service pour vous faire gagner du temps.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h2 className="text-2xl font-semibold text-gray-900">Nos valeurs</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Notre approche</h3>
            <p className="mt-2 text-gray-700 leading-relaxed">
              • Un simulateur pour chiffrer rapidement votre course.<br />
              • Des convoyeurs et plateaux fiables, partout en France.<br />
              • Un devis PDF propre envoyé automatiquement par email.<br />
              • Un support humain, réactif, quand vous en avez besoin.
            </p>
          </div>

          <div className="mt-12">
            <a
              href="/simulateur"
              className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-white font-medium shadow hover:bg-indigo-700 transition"
            >
              Obtenir un devis
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
