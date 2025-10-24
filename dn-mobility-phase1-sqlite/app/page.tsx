// app/page.tsx
import Image from "next/image"

const logos = [
  { name: "Renault", src: "/partners/renault.svg" },
  { name: "Peugeot", src: "/partners/peugeot.svg" },
  { name: "Aramis", src: "/partners/aramis.svg" },
  { name: "Sixt", src: "/partners/sixt.svg" },
  { name: "Hertz", src: "/partners/hertz.svg" },
  { name: "Spoticar", src: "/partners/spoticar.svg" },
]

const features = [
  {
    title: "Réservation simple",
    desc: "Un simulateur clair, des étapes rapides, confirmation instantanée.",
    icon: "🚗",
  },
  {
    title: "Tarif transparent",
    desc: "Prix calculé à la distance, sans frais cachés. Devis PDF envoyé par email.",
    icon: "💶",
  },
  {
    title: "Couverture nationale",
    desc: "Convoyage & plateau partout en France métropolitaine.",
    icon: "🇫🇷",
  },
]

const testimonials = [
  {
    author: "Carla M.",
    role: "Responsable flotte, retail",
    quote:
      "Ultra réactifs, prix clairs, livraison à l’heure. C’est devenu notre partenaire régulier.",
  },
  {
    author: "Yanis R.",
    role: "Chef d’atelier",
    quote:
      "Le suivi et la communication sont au top. On gagne un temps fou sur nos transferts.",
  },
  {
    author: "Sophie L.",
    role: "Particulier",
    quote:
      "Impeccable du premier contact à la livraison. Je recommande sans hésiter.",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-indigo-700 bg-white shadow-sm">
                Convoyage & transport de véhicules
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
                Déplacez vos véhicules, <span className="text-indigo-600">sans friction</span>
              </h1>
              <p className="mt-5 text-gray-600 leading-relaxed">
                DN Mobility gère vos transferts en <strong>convoyeur</strong> ou <strong>plateau</strong>.
                Devis instantané, planning flexible, et un suivi soigné.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/simulateur"
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-white font-medium shadow hover:bg-indigo-700 transition"
                >
                  Obtenir un devis
                </a>
                <a
                  href="#partenaires"
                  className="inline-flex items-center rounded-xl border px-5 py-3 text-gray-800 font-medium hover:bg-gray-50 transition"
                >
                  Nos partenaires
                </a>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Besoin d’un transfert récurrent ?{" "}
                <a href="/contact" className="underline">Contactez-nous</a>.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white shadow-lg">
                <Image
                  src="/hero-van.jpg" // remplace par ta photo
                  alt="Convoyage DN Mobility"
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section id="partenaires" className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-center text-sm font-medium text-gray-500">
            Ils nous font confiance
          </p>
          <div className="mt-6 grid grid-cols-2 items-center gap-8 opacity-80 sm:grid-cols-3 md:grid-cols-6">
            {logos.map((l) => (
              <div key={l.name} className="flex items-center justify-center">
                <Image
                  src={l.src}
                  alt={l.name}
                  width={120}
                  height={42}
                  className="max-h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Pourquoi DN Mobility ?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVIS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Avis de nos clients
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.author}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <blockquote className="text-gray-800 leading-relaxed">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{t.author}</span> — {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500" />
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Prêt à déplacer votre véhicule ?
          </h2>
          <p className="mt-3 text-indigo-100">
            Devis en ligne en moins d’une minute, envoi PDF immédiat.
          </p>
          <div className="mt-8">
            <a
              href="/simulateur"
              className="inline-flex items-center rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow hover:bg-indigo-50 transition"
            >
              Lancer le simulateur
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
