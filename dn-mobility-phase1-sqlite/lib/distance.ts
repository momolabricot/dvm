const R = 6371
const toRad = (d:number)=> d*Math.PI/180
function haversineKm(a:{lat:number,lon:number}, b:{lat:number,lon:number}){
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const la1 = toRad(a.lat), la2 = toRad(b.lat)
  const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2
  return 2*R*Math.asin(Math.sqrt(h))
}
export async function drivingDistanceKm(a:{lat:number,lon:number}, b:{lat:number,lon:number}): Promise<number>{
  try{
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
    const res = await fetch(url, { cache: 'no-store' })
    if(!res.ok) throw new Error('OSRM error')
    const json:any = await res.json()
    const meters = json.routes?.[0]?.distance
    if(meters) return meters/1000
    throw new Error('No route')
  }catch{
    return haversineKm(a,b) * 1.2
  }
}
