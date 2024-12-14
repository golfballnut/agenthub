import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get request body
    const { name, website_url } = await request.json()

    // Validate input
    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    // Update competitor
    const { error } = await supabase
      .from('competitors')
      .update({ 
        name,
        website_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating competitor:', error)
      return new NextResponse('Failed to update competitor', { status: 500 })
    }

    return new NextResponse('Competitor updated successfully', { status: 200 })
  } catch (error) {
    console.error('Error in PUT /api/scraping/competitors/[id]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 