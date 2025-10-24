import type { MetadataRoute } from 'next'
import { cities } from '@/lib/cities'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const now = new Date().toISOString()
    const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/a-propos`, lastModified: now },
    { url: `${base}/simulateur`, lastModified: now },
    { url: `${base}/contact`, lastModified: now },
    { url: `${base}/mentions-legales`, lastModified: now },          // ✅
    { url: `${base}/donnees-personnelles`, lastModified: now },       // ✅
    ...cities.map(c=>({ url: `${base}/zones/${c.slug}`, lastModified: now })),
  ]

  return urls
}
