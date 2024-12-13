import { NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase-server'

export async function POST(request: Request) {
  try {
    const { name, team_id, description } = await request.json()
    
    if (!name || !team_id) {
      return NextResponse.json(
        { error: 'Name and team ID are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create agent
    const { data, error } = await supabase
      .from('agents')
      .insert([{ 
        name,
        team_id,
        description,
        user_id: user.id
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: 'Error creating agent' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const team_id = searchParams.get('team_id')

    if (!team_id) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get agents for team
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('team_id', team_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Error fetching agents' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete agent
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { error: 'Error deleting agent' },
      { status: 500 }
    )
  }
} 