// lib/pricing-user.ts
export function applyUserMultiplier(baseTTC: number, userMultiplier = 1) {
  const ttc = Math.max(0, baseTTC * userMultiplier)
  return ttc
}
