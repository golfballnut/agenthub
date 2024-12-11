import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { integrationId, apiKey } = await request.json()
    
    if (!integrationId || !apiKey) {
      return NextResponse.json(
        { error: 'Integration ID and API key are required' },
        { status: 400 }
      )
    }

    // Create supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update the API key
    const { error: updateError } = await supabase
      .from('integrations')
      .update({ api_key: apiKey })
      .eq('id', integrationId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully'
    })
  } catch (error) {
    console.error('Update API key error:', error)
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    )
  }
} 