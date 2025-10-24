export const cities = [
  { slug:'bordeaux', name:'Bordeaux', keywords:['convoyeur','plateau','Aquitaine'] },
  { slug:'pau', name:'Pau', keywords:['convoyeur','plateau'] },
  { slug:'bayonne', name:'Bayonne', keywords:['convoyeur','plateau'] },
  { slug:'toulouse', name:'Toulouse', keywords:['convoyeur','plateau'] },
  { slug:'limoges', name:'Limoges', keywords:['convoyeur','plateau'] },
  { slug:'angouleme', name:'Angoulême', keywords:['convoyeur','plateau'] },
  { slug:'niort', name:'Niort', keywords:['convoyeur','plateau'] },
  { slug:'nantes', name:'Nantes', keywords:['convoyeur','plateau'] },
  { slug:'aquitaine', name:'Aquitaine', keywords:['convoyeur','plateau','région'] },
]
export const cityBySlug = (slug: string) => {
  const c = cities.find(x=>x.slug===slug)
  if (!c) throw new Error('Ville inconnue')
  return c
}
