'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Integration {
  id: string
  name: string
  connected: boolean
  created_at: string
  last_connected_at: string | null
}

interface MockData {
  products?: Array<{ id: number; name: string; price: number }>
  tasks?: Array<{ id: number; title: string; status: string }>
  contacts?: Array<{ id: number; name: string; email: string }>
  videos?: Array<{ id: string; title: string; views: number; likes: number }>
  proxies?: Array<{ id: string; region: string; status: string; bandwidth: string }>
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [mockData, setMockData] = useState<{ [key: string]: MockData | null }>({})
  const [loadingData, setLoadingData] = useState<{ [key: string]: boolean }>({})
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

  const fetchMockData = async (integration: Integration) => {
    setLoadingData(prev => ({ ...prev, [integration.id]: true }))
    setError(null)

    try {
      const response = await fetch('/api/integrations/mock-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source: integration.name }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)
      
      setMockData(prev => ({ ...prev, [integration.id]: data }))
    } catch (err) {
      console.error('Error fetching mock data:', err)
      setError('Failed to fetch data')
    } finally {
      setLoadingData(prev => ({ ...prev, [integration.id]: false }))
    }
  }

  const renderMockData = (data: MockData) => {
    if (data.products) {
      return (
        <div className="mt-4 bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Products</h4>
          <div className="space-y-2">
            {data.products.map(product => (
              <div key={product.id} className="text-sm text-white/60">
                {product.name} - ${product.price}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (data.tasks) {
      return (
        <div className="mt-4 bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Tasks</h4>
          <div className="space-y-2">
            {data.tasks.map(task => (
              <div key={task.id} className="text-sm text-white/60">
                {task.title} - {task.status}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (data.contacts) {
      return (
        <div className="mt-4 bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Contacts</h4>
          <div className="space-y-2">
            {data.contacts.map(contact => (
              <div key={contact.id} className="text-sm text-white/60">
                {contact.name} - {contact.email}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (data.videos) {
      return (
        <div className="mt-4 bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Videos</h4>
          <div className="space-y-2">
            {data.videos.map(video => (
              <div key={video.id} className="text-sm text-white/60">
                <div>{video.title}</div>
                <div className="text-xs text-white/40">
                  {video.views.toLocaleString()} views • {video.likes.toLocaleString()} likes
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (data.proxies) {
      return (
        <div className="mt-4 bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Proxies</h4>
          <div className="space-y-2">
            {data.proxies.map(proxy => (
              <div key={proxy.id} className="text-sm text-white/60">
                <div className="flex items-center justify-between">
                  <span>{proxy.region}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    proxy.status === 'active' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {proxy.status}
                  </span>
                </div>
                <div className="text-xs text-white/40">
                  Bandwidth used: {proxy.bandwidth}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
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

            {integration.connected && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => fetchMockData(integration)}
                  disabled={loadingData[integration.id]}
                  className="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  {loadingData[integration.id] ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      Fetch Data
                    </>
                  )}
                </button>

                {mockData[integration.id] && renderMockData(mockData[integration.id]!)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 