// lib/auth.ts
import { getServerSession, type NextAuthOptions } from 'next-auth'
import { NextResponse } from 'next/server'

// On ré-exporte les options de NextAuth depuis la route API
// pour permettre `import { authOptions } from '@/lib/auth'`
import { authOptions as _authOptions } from '@/app/api/auth/[...nextauth]/route'

export const authOptions: NextAuthOptions = _authOptions as NextAuthOptions

export async function auth() {
  return getServerSession(authOptions)
}

/**
 * Helpers role-based (compatibles avec ce que tu utilises déjà)
 */
export type Role = 'ADMIN' | 'ADMIN_IT' | 'CLIENT' | 'CONVOYEUR'

export async function requireRole(roles: Role[] | Role) {
  const allow = Array.isArray(roles) ? roles : [roles]
  const session = await auth()
  const role = (session?.user as any)?.role as Role | undefined
  if (!session || !role || !allow.includes(role)) {
    const err = new Error(!session ? 'UNAUTHORIZED' : 'FORBIDDEN')
    throw err
  }
}

export async function getSessionUser() {
  const session = await auth()
  if (!session?.user?.email) return null
  return {
    id: (session.user as any).id ?? null,
    email: session.user.email,
    name: session.user.name ?? null,
    role: (session.user as any).role ?? null,
  }
}
