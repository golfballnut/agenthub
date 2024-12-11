import { NextResponse } from 'next/server'

const CHAT_MODEL_PREFIXES = ['gpt-3.5-turbo', 'gpt-4']

async function getProviderModels(provider: string) {
  switch (provider) {
    case 'openai': {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch OpenAI models')
      }

      const data = await response.json()
      return data.data
        .filter((model: any) => 
          CHAT_MODEL_PREFIXES.some(prefix => model.id.startsWith(prefix))
        )
        .map((model: any) => ({
          id: model.id,
          name: model.id.replace('gpt-', 'GPT-').replace('-turbo', ' Turbo'),
        }))
    }
    
    case 'claude':
      return [
        { id: 'claude-2', name: 'Claude 2' },
        { id: 'claude-instant', name: 'Claude Instant' }
      ]
      
    case 'perplexity':
      return [
        { id: 'pplx-7b-chat', name: 'Perplexity 7B' },
        { id: 'pplx-70b-chat', name: 'Perplexity 70B' }
      ]

    default:
      throw new Error('Unsupported provider')
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      )
    }

    const models = await getProviderModels(provider)
    
    if (!models || models.length === 0) {
      return NextResponse.json(
        { error: 'No models found for this provider' },
        { status: 404 }
      )
    }

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch models' },
      { status: 500 }
    )
  }
} 