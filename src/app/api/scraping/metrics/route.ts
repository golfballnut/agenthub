import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { authOptions } from '../../auth/[...nextauth]/route'
import type { Database } from '@/types/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookies()
    })

    const [
      { count: totalCompetitors },
      { count: totalConditions },
      { count: totalMatches }
    ] = await Promise.all([
      supabase.from('competitors').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
      supabase.from('conditions').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id)
    ])

    return NextResponse.json({
      totalCompetitors: totalCompetitors || 0,
      totalConditions: totalConditions || 0,
      totalMatches: totalMatches || 0
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
} 