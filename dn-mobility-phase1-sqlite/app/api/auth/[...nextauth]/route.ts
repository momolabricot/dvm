// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Email & Mot de passe',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, passwordHash: true, role: true, name: true, isActive: true },
        })

        if (!user || !user.isActive || !user.passwordHash) return null

        const ok = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!ok) return null

        // IMPORTANT: on retourne un objet avec id/role/etc.
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` n'est défini que lors du login initial
      if (user) {
        token.role = (user as any).role
        token.name = user.name || token.name
        // on stocke explicitement l'id (même si NextAuth le met en token.sub)
        ;(token as any).userId = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // ✅ injecte le rôle dans la session
        ;(session.user as any).role = (token as any).role
        // ✅ injecte l'id dans la session pour l'utiliser côté serveur
        ;(session.user as any).id = (token as any).userId || token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
