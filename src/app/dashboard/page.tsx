'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Chat from '@/components/dashboard/Chat'

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-white/60">
          Welcome to your AI dashboard
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Welcome Section */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Getting Started
          </h2>
          <p className="text-white/60 mb-4">
            Explore integrated providers, manage model configurations, and work on custom AI projects.
            Use the chat interface to interact with various AI models.
          </p>
        </div>

        {/* Chat Interface with Stats */}
        <div className="lg:row-span-4">
          <Chat />
        </div>

        {/* Providers Section */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Providers
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'OpenAI', status: 'Connected' },
              { name: 'Anthropic', status: 'Available' },
              { name: 'Azure OpenAI', status: 'Available' },
              { name: 'Cohere', status: 'Available' },
            ].map((provider) => (
              <div 
                key={provider.name}
                className="p-4 bg-white/5 rounded-lg"
              >
                <h3 className="font-medium text-white">{provider.name}</h3>
                <p className="text-sm text-white/60">{provider.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Models Section */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Models
          </h2>
          <div className="space-y-4">
            {[
              { name: 'GPT-4', description: 'Advanced reasoning and creativity' },
              { name: 'GPT-3.5-Turbo', description: 'Balanced speed and capability' },
              { name: 'Claude 2', description: 'High performance, from Anthropic' },
            ].map((model) => (
              <div 
                key={model.name}
                className="p-4 bg-white/5 rounded-lg"
              >
                <h3 className="font-medium text-white">{model.name}</h3>
                <p className="text-sm text-white/60">{model.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Projects / Custom GPTs
          </h2>
          <div className="space-y-4">
            {[
              { name: 'E-Commerce Assistant', description: 'Custom GPT tailored for product recommendations' },
              { name: 'Marketing Copywriter', description: 'Generates compelling marketing content' },
              { name: 'Tech Support Bot', description: 'Answers common troubleshooting questions' },
            ].map((project) => (
              <div 
                key={project.name}
                className="p-4 bg-white/5 rounded-lg"
              >
                <h3 className="font-medium text-white">{project.name}</h3>
                <p className="text-sm text-white/60">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 