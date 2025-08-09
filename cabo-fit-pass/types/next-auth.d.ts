import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string
    user: {
      /** The user's postal address. */
      id: string
      role: string
      credits: number
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    credits?: number
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string
    role?: string
    credits?: number
  }
}