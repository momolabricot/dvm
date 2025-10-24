import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string | null
      email: string
      role: 'ADMIN' | 'ADMIN_IT' | 'CLIENT'
    }
  }

  interface User {
    id: string
    name: string | null
    email: string
    role: 'ADMIN' | 'ADMIN_IT' | 'CLIENT'
    passwordHash?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'ADMIN_IT' | 'CLIENT'
  }
}
