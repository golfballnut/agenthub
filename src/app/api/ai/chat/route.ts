import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.PROVIDER_OPENAI_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.PROVIDER_CLAUDE_API_KEY,
})

interface ChatRequest {
  messages: { role: string; content: string }[]
  provider: string
  model: string
}

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

export async function POST(request: Request) {
  try {
    // Validate request body
    const body = await request.json() as ChatRequest
    if (!body.messages?.length || !body.provider || !body.model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Handle different providers
    let response
    switch (body.provider) {
      case 'openai':
        if (!process.env.PROVIDER_OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured')
        }

        if (!isOpenAIChatModel(body.model)) {
          return NextResponse.json(
            { error: 'Selected model does not support chat or is not available' },
            { status: 400 }
          )
        }

        response = await openai.chat.completions.create({
          model: body.model,
          messages: body.messages.map(m => ({
            role: m.role as ChatCompletionMessageParam['role'],
            content: m.content
          }))
        })

        return NextResponse.json({
          role: 'assistant',
          content: response.choices[0].message.content
        })

      case 'claude':
        if (!process.env.PROVIDER_CLAUDE_API_KEY) {
          throw new Error('Claude API key not configured')
        }
        response = await anthropic.messages.create({
          model: body.model,
          max_tokens: 1000,
          messages: body.messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })) as { role: 'user' | 'assistant'; content: string }[],
        })
        return NextResponse.json({
          role: 'assistant',
          content: response.content[0].type === 'text' ? response.content[0].text : '',
        })

      case 'perplexity':
        if (!process.env.PROVIDER_PERPLEXITY_API_KEY) {
          throw new Error('Perplexity API key not configured')
        }
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PROVIDER_PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: body.model,
            messages: body.messages,
          }),
        })
        const data = await response.json()
        return NextResponse.json({
          role: 'assistant',
          content: data.choices[0].message.content,
        })

      default:
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' },
      { status: 500 }
    )
  }
} 