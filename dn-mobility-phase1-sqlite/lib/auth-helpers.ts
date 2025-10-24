// lib/auth-helpers.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export type Role = 'ADMIN' | 'ADMIN_IT' | 'CLIENT' | 'CONVOYEUR'

export type SessionUser = {
  id: string
  role: Role
  email?: string | null
  name?: string | null
  isActive?: boolean
  [k: string]: any
}

export async function getSession() {
  return getServerSession(authOptions as any)
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions as any)
  const u = session?.user as any
  if (!u?.id) return null
  return u as SessionUser
}

export async function requireRole(roles: Role[]) {
  const session = await getServerSession(authOptions as any)
  const user = session?.user as any
  if (!user) throw new Error('UNAUTHORIZED')
  const role: Role | undefined = user.role
  if (!role || !roles.includes(role)) throw new Error('FORBIDDEN')
  return session
}
