'use client'

import { useState } from 'react'
import { PaperAirplaneIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Provider {
  id: string
  name: string
  models: { id: string; name: string }[]
}

const providers: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    models: [
      { id: 'claude-2', name: 'Claude 2' },
      { id: 'claude-instant', name: 'Claude Instant' },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    models: [
      { id: 'pplx-latest', name: 'Latest' },
      { id: 'pplx-experimental', name: 'Experimental' },
    ],
  },
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState(providers[0])
  const [selectedModel, setSelectedModel] = useState(providers[0].models[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    const newMessages = [
      ...messages,
      { role: 'user', content: input.trim() } as Message
    ]

    setMessages(newMessages)
    setInput('')

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error processing request')
      }

      setMessages([...newMessages, data])
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error sending message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-white">AI Chat</h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="relative">
              <select
                value={selectedProvider.id}
                onChange={(e) => {
                  const provider = providers.find(p => p.id === e.target.value)
                  if (provider) {
                    setSelectedProvider(provider)
                    setSelectedModel(provider.models[0])
                  }
                }}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white pr-8 focus:outline-none focus:ring-1 focus:ring-[#FFBE1A]"
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-white/40 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedModel.id}
                onChange={(e) => {
                  const model = selectedProvider.models.find(m => m.id === e.target.value)
                  if (model) setSelectedModel(model)
                }}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white pr-8 focus:outline-none focus:ring-1 focus:ring-[#FFBE1A]"
              >
                {selectedProvider.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-white/40 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
        <p className="text-sm text-white/60">
          Chat with AI
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-white/40 mt-8">
            Start a conversation with AI
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-[#FFBE1A] text-black'
                    : 'bg-white/5 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-white rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="px-4 py-3 border-t border-white/5 bg-white/5">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-white/40">Messages today</div>
            <div className="text-white font-medium">50</div>
          </div>
          <div>
            <div className="text-white/40">Avg. response time</div>
            <div className="text-white font-medium">2.3s</div>
          </div>
          <div>
            <div className="text-white/40">Active projects</div>
            <div className="text-white font-medium">3</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFBE1A] focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#FFBE1A] text-black px-4 py-2 rounded-lg hover:bg-[#FFBE1A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
} 