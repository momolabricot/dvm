import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap { return [ '/', '/a-propos', '/simulateur', '/contact' ].map(p=>({ url: `https://dnmobility.fr${p}`, lastModified: new Date() })) }
