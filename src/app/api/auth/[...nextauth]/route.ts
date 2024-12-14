import NextAuth from 'next-auth/next'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Supabase',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error || !user) return null

        // Create profile if it doesn't exist
        const { data: profile } = await supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single()

        if (!profile) {
          await supabase
            .from('profiles')
            .insert([{ 
              id: user.id,
              full_name: user.email?.split('@')[0] || '',
              username: user.email?.split('@')[0] || '',
              avatar_url: null,
              updated_at: new Date().toISOString()
            }])
            .select()
            .single()
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email?.split('@')[0]
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 