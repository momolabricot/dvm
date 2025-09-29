import './globals.css'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConsentBanner from '@/components/ConsentBanner'
import Analytics from '@/components/Analytics'

export const metadata = {
  title: 'DN Mobility — Convoyage & Plateau',
  description: 'Convoyeur de véhicules en Aquitaine et grandes villes: Bordeaux, Pau, Bayonne, Toulouse, Limoges, Angoulême, Niort, Nantes.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  alternates: { canonical: 'https://dnmobility.fr' }
}

export default function RootLayout({children}:{children: React.ReactNode}){
  return (
    <html lang="fr">
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <Footer />
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  )
}
