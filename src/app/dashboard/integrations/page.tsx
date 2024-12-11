'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Integration {
  id: string
  name: string
  connected: boolean
  created_at: string
  last_connected_at: string | null
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchIntegrations = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('integrations')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError

      setIntegrations(data || [])
    } catch (err) {
      console.error('Error fetching integrations:', err)
      setError('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const toggleConnection = async (integrationId: string) => {
    setUpdating(integrationId)
    try {
      const integration = integrations.find(i => i.id === integrationId)
      if (!integration) return

      if (!integration.connected) {
        // Connect flow
        const response = await fetch('/api/integrations/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ source: integration.name }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to connect')
        }
      } else {
        // Disconnect flow - direct database update
        const { error: updateError } = await supabase
          .from('integrations')
          .update({ 
            connected: false,
            last_connected_at: null
          })
          .eq('id', integrationId)

        if (updateError) throw updateError
      }

      await fetchIntegrations()
    } catch (err) {
      console.error('Error updating integration:', err)
      setError('Failed to update integration')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse text-white/60">Loading integrations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="mt-1 text-white/60">
          Connect your data sources and tools
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-[#111111] border border-white/5 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {integration.name}
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  {integration.connected ? (
                    <span className="flex items-center text-green-500">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Connected
                      {integration.last_connected_at && (
                        <span className="text-white/40 ml-2">
                          {new Date(integration.last_connected_at).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center text-white/40">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Not connected
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleConnection(integration.id)}
                  disabled={updating === integration.id}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                    ${integration.connected
                      ? 'bg-white/5 text-white hover:bg-white/10'
                      : 'bg-[#FFBE1A] text-black hover:bg-[#FFBE1A]/90'
                    }`}
                >
                  {updating === integration.id ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : integration.connected ? (
                    'Disconnect'
                  ) : (
                    'Connect'
                  )}
                </button>
                <Link
                  href={`/dashboard/integrations/${integration.id}/configure`}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-white/5 text-white hover:bg-white/10"
                >
                  Configure
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 