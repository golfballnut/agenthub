import { NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase-server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider')?.toLowerCase()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: models, error } = await supabase
      .from('llm_models')
      .select('model_id, display_name, description')
      .eq('provider', provider)
      .eq('active', true)
      .eq('supports_chat', true)
      .order('display_name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch models from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      models: models.map(model => ({
        id: model.model_id,
        name: model.display_name,
        description: model.description,
        provider
      }))
    })

  } catch (error) {
    console.error('Error in models endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models. Please try again later.' },
      { status: 500 }
    )
  }
} 