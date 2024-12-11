import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { integrationId } = await request.json()
    
    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the API key for this integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('api_key')
      .eq('id', integrationId)
      .single()

    if (integrationError || !integration?.api_key) {
      throw new Error('Failed to get API key')
    }

    // Make real HubSpot API call
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      headers: {
        'Authorization': `Bearer ${integration.api_key}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'HubSpot API error')
    }

    const data = await response.json()
    
    // Transform HubSpot data to match our interface
    const contacts = data.results.map((contact: any) => ({
      id: contact.id,
      name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
      email: contact.properties.email || '',
      company: contact.properties.company || '',
      phone: contact.properties.phone || '',
    }))

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('HubSpot API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch HubSpot data' },
      { status: 500 }
    )
  }
} 