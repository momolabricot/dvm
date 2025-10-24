// lib/auth.ts
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// ⚠️ Adapte ce chemin si ton fichier NextAuth est ailleurs
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

type Role = 'ADMIN' | 'ADMIN_IT' | 'CLIENT' | 'CONVOYEUR'

export async function getSessionUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  // On charge l’utilisateur depuis la DB pour récupérer son rôle, id, état…
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      isActive: true,
    },
  })

  if (!user || !user.isActive) {
    return null
  }

  return user
}

/**
 * Exige une session + un rôle parmi `allowed`.
 * - Lève une exception si non autorisé (à gérer dans la route appelante).
 */
export async function requireRole(allowed: Role[]) {
  const user = await getSessionUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  if (!allowed.includes(user.role as Role)) throw new Error('FORBIDDEN')
  return user
}
