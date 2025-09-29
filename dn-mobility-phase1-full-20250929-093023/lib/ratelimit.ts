const buckets = new Map<string, {count:number, reset:number}>()
export function rateLimit(key:string, limit=10, windowMs=60_000){
  const now = Date.now()
  const b = buckets.get(key)
  if(!b || now > b.reset){ buckets.set(key, {count:1, reset: now + windowMs}); return {ok:true, remaining: limit-1} }
  if(b.count >= limit){ return {ok:false, retryAfter: Math.ceil((b.reset - now)/1000)} }
  b.count += 1; return {ok:true, remaining: limit - b.count}
}
export function ipFromHeaders(headers: Headers){
  const xf = headers.get('x-forwarded-for') || ''
  return xf.split(',')[0].trim() || 'local'
}
