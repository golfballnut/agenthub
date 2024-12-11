import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { source } = await request.json()
    
    if (!source) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      )
    }

    // Log the connection attempt
    console.log(`Integration connection attempt for: ${source}`)

    // Create supabase client with cookies passed directly
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update integration status
    const { error: updateError } = await supabase
      .from('integrations')
      .update({ 
        connected: true,
        last_connected_at: new Date().toISOString()
      })
      .eq('name', source)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: `Successfully connected to ${source}`
    })
  } catch (error) {
    console.error('Integration connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect integration' },
      { status: 500 }
    )
  }
} 