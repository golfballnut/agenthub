import { createServerClient } from '@/utils/supabase-server'
import { handleRequest } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { table, action, payload, filters } = body

    if (!table || !action) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Handle the request
    const result = await handleRequest({
      supabase,
      table,
      action,
      payload,
      filters,
      user
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 