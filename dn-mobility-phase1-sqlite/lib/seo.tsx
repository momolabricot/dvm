'use client'
import Script from 'next/script'
import { cities } from './cities'

const COMPANY = {
  name: 'DN Mobility',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  phone: '+33500000000',
  email: 'contact@dnmobility.fr',
  siret: '12345678900011',
  address: {
    streetAddress: '1 Rue Exemple',
    addressLocality: 'Bordeaux',
    postalCode: '33000',
    addressCountry: 'FR'
  }
}

export function LocalBusinessJsonLD() {
  const data = {
    '@context':'https://schema.org',
    '@type':'LocalBusiness',
    name: COMPANY.name,
    url: COMPANY.url,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    identifier: COMPANY.siret,
    address: { '@type':'PostalAddress', ...COMPANY.address },
    areaServed: cities.map(c=>({ '@type':'City', name: c.name })),
    sameAs: []
  }
  return <Script id="ld-local" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function CityServiceJsonLD({ city }: { city: string }) {
  const data = {
    '@context':'https://schema.org',
    '@type':'Service',
    serviceType: 'Convoyage de véhicules / Transport plateau',
    provider: { '@type':'LocalBusiness', name: COMPANY.name, url: COMPANY.url },
    areaServed: { '@type':'City', name: city }
  }
  return <Script id={`ld-service-${city}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
