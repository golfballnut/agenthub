import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { handleRequest } from '@/lib/db'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Create Supabase client with session
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookies()
    })

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')?.toLowerCase()

    const result = await handleRequest({
      supabase,
      table: 'llm_models',
      action: 'select',
      filters: provider ? { provider } : undefined,
      user: session.user
    })

    return NextResponse.json({ models: result })
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 