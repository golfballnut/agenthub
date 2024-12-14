'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Model {
  id: string
  name: string
  description: string
  provider: string
}

interface Provider {
  name: string
  models: Model[]
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('openai')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const supabase = createClientComponentClient<Database>()

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
    loadModels()
  }, [])

  async function loadChatHistory() {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      if (messages) {
        setMessages(messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })))
      }
    } catch (err) {
      console.error('Error loading chat history:', err)
      setError('Failed to load chat history')
    }
  }

  async function loadModels() {
    try {
      setIsLoadingModels(true)
      
      // Get models directly from Supabase
      const { data: models, error } = await supabase
        .from('llm_models')
        .select('*')
        .order('display_name')

      if (error) throw error

      // Group models by provider
      const providerData = models.reduce((acc: Provider[], model) => {
        const provider = acc.find(p => p.name === model.provider)
        const modelData = {
          id: model.model_id,
          name: model.display_name,
          description: model.description || '',
          provider: model.provider
        }

        if (provider) {
          provider.models.push(modelData)
        } else {
          acc.push({
            name: model.provider,
            models: [modelData]
          })
        }
        return acc
      }, [])

      setProviders(providerData.filter(p => p.models.length > 0))
      
      // Set default provider and model
      if (providerData.length > 0 && providerData[0].models.length > 0) {
        setSelectedProvider(providerData[0].name)
        setSelectedModel(providerData[0].models[0].id)
      }
    } catch (err) {
      console.error('Error fetching models:', err)
      setError('Failed to load models')
    } finally {
      setIsLoadingModels(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !selectedModel) return

    const newMessage: Message = { role: 'user', content: input }
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      // Save user message to database
      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert([{
          role: 'user',
          content: input,
          user_id: user.id
        }])

      if (saveError) throw saveError

      setMessages(prev => [...prev, newMessage])
      setInput('')
      setIsLoading(true)
      setError(null)

      // Send message to AI
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          model: selectedModel,
          provider: selectedProvider
        })
      })

      if (!response.ok) throw new Error('Failed to get response')
      
      const data = await response.json()

      // Save AI response to database
      const { error: saveResponseError } = await supabase
        .from('chat_messages')
        .insert([{
          role: 'assistant',
          content: data.content,
          user_id: user.id
        }])

      if (saveResponseError) throw saveResponseError

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (err) {
      console.error('Chat error:', err)
      setError('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[600px] bg-[#111111] border-white/5">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-semibold text-white">AI Chat</h2>
        <div className="mt-2 space-y-2">
          {isLoadingModels ? (
            <div className="text-white/60">Loading models...</div>
          ) : (
            <>
              {/* Provider Selection */}
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value)
                  const providerModels = providers.find(p => p.name === e.target.value)?.models ?? []
                  if (providerModels.length > 0) {
                    setSelectedModel(providerModels[0].id)
                  }
                }}
                className="w-full bg-white/5 text-white border border-white/10 rounded-md p-2"
                disabled={isLoadingModels}
              >
                {providers.map(provider => (
                  <option key={provider.name} value={provider.name}>
                    {provider.name.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Model Selection */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white/5 text-white border border-white/10 rounded-md p-2"
                disabled={isLoadingModels}
              >
                {providers
                  .find(p => p.name === selectedProvider)
                  ?.models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-white rounded-lg p-3">
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 text-red-500 rounded-lg p-3">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 text-white border border-white/10 rounded-md p-2"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </Card>
  )
} 