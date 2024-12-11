'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useRouter, useParams } from 'next/navigation'

interface Integration {
  id: string
  name: string
  connected: boolean
}

export default function ConfigureIntegration() {
  const params = useParams()
  const id = params.id as string
  const [integration, setIntegration] = useState<Integration | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (id) {
      fetchIntegration()
    }
  }, [id])

  const fetchIntegration = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('integrations')
        .select('id, name, connected')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setIntegration(data)
    } catch (err) {
      console.error('Error fetching integration:', err)
      setError('Failed to load integration')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }

    setTesting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationId: id,
          apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)
      setSuccess('Connection test successful')
    } catch (err) {
      console.error('Test connection error:', err)
      setError(err instanceof Error ? err.message : 'Connection test failed')
    } finally {
      setTesting(false)
    }
  }

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/integrations/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationId: id,
          apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)
      setSuccess('API key saved successfully')
      setApiKey('') // Clear the API key from state
      router.push('/dashboard/integrations')
    } catch (err) {
      console.error('Save API key error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save API key')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    )
  }

  if (!integration) {
    return (
      <div className="p-4">
        <div className="text-red-500">Integration not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configure {integration.name}</h1>
        <p className="mt-1 text-white/60">
          Set up your integration credentials
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <div className="space-y-6">
          {/* API Key Input */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-white mb-2">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFBE1A] focus:border-transparent"
              placeholder="Enter your API key"
            />
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-500">
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={testConnection}
              disabled={testing || !apiKey.trim()}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
            >
              {testing ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                'Test Connection'
              )}
            </button>
            <button
              onClick={saveApiKey}
              disabled={saving || !apiKey.trim()}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 bg-[#FFBE1A] text-black hover:bg-[#FFBE1A]/90 disabled:opacity-50"
            >
              {saving ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                'Save API Key'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 