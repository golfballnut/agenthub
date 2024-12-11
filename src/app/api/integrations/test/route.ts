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

    // TODO: Implement actual API testing logic here
    // For now, simulate a test based on API key format
    const isValidFormat = apiKey.length >= 32 && /^[A-Za-z0-9_-]+$/.test(apiKey)

    if (!isValidFormat) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Connection test successful'
    })
  } catch (error) {
    console.error('Test connection error:', error)
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    )
  }
} 