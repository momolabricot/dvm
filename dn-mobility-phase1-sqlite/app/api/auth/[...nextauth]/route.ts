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
          select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true,
            name: true,
            isActive: true,
          },
        })

        if (!user || !user.isActive || !user.passwordHash) return null

        const ok = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!ok) return null

        // On renvoie bien l'id pour pouvoir l’injecter dans le JWT/session
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
      // Quand l’utilisateur vient de se connecter, propager les infos utiles dans le token
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.name = (user as any).name || token.name
        token.email = (user as any).email || token.email
      }
      return token
    },
    async session({ session, token }) {
      // Remonter les champs dans session.user (y compris id)
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
        session.user.name = (token.name as string) || session.user.name
        session.user.email = (token.email as string) || session.user.email
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
