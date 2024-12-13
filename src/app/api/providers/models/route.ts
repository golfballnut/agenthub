import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.PROVIDER_OPENAI_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.PROVIDER_CLAUDE_API_KEY,
})

// Helper to identify chat-compatible models
function isOpenAIChatModel(modelId: string): boolean {
  // Only include currently supported models
  const supportedModels = [
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k'
  ]
  return supportedModels.includes(modelId)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider')

  try {
    if (provider === 'openai') {
      if (!process.env.PROVIDER_OPENAI_API_KEY) {
        throw new Error('Missing PROVIDER_OPENAI_API_KEY')
      }

      // Use static list of supported models instead of API call
      const models = [
        { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K' }
      ].map(model => ({
        ...model,
        provider: 'openai'
      }))
      
      return NextResponse.json({ models })
    }

    if (provider === 'claude') {
      if (!process.env.PROVIDER_CLAUDE_API_KEY) {
        throw new Error('Missing PROVIDER_CLAUDE_API_KEY')
      }

      // Claude has a fixed set of models
      const models = [
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' }
      ].map(model => ({
        ...model,
        provider: 'claude'
      }))

      return NextResponse.json({ models })
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch models' },
      { status: 500 }
    )
  }
} 