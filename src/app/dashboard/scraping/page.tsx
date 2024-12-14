'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import Competitors from './competitors'

const tabs = [
  { name: 'Competitors', component: Competitors },
  { name: 'Conditions', component: () => <div>Conditions coming soon...</div> },
  { name: 'Product Matches', component: () => <div>Product matches coming soon...</div> }
]

interface Competitor {
  id: string
  name: string
  website_url: string | null
  created_at: string
}

interface Metrics {
  totalCompetitors: number
  totalConditions: number
  totalMatches: number
}

export default function ScrapingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    website_url: ''
  })
  const [metrics, setMetrics] = useState<Metrics>({
    totalCompetitors: 0,
    totalConditions: 0,
    totalMatches: 0
  })

  useEffect(() => {
    fetchCompetitors()
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/scraping/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load metrics')
    }
  }

  const fetchCompetitors = async () => {
    try {
      const response = await fetch('/api/scraping/competitors')
      if (!response.ok) throw new Error('Failed to fetch competitors')
      const data = await response.json()
      setCompetitors(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load competitors')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (competitor: Competitor) => {
    setEditingId(competitor.id)
    setEditForm({
      name: competitor.name,
      website_url: competitor.website_url || ''
    })
  }

  const handleEditSubmit = async (id: string) => {
    try {
      const response = await fetch(`/api/scraping/competitors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) throw new Error('Failed to update competitor')
      
      toast.success('Competitor updated successfully')
      setEditingId(null)
      fetchCompetitors()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update competitor')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/scraping/competitors?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete competitor')
      
      toast.success('Competitor deleted successfully')
      fetchCompetitors()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete competitor')
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading competitors...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Web Scraping</h1>
        <p className="mt-1 text-gray-400">
          Manage your competitors, conditions, and product matches
        </p>
      </div>

      {/* Metrics Display */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Competitors</p>
          <p className="text-xl font-bold">{metrics.totalCompetitors}</p>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Conditions</p>
          <p className="text-xl font-bold">{metrics.totalConditions}</p>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Matches</p>
          <p className="text-xl font-bold">{metrics.totalMatches}</p>
        </div>
      </div>

      <div className="w-full">
        <nav className="flex space-x-1 bg-white/5 p-1 rounded-lg">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60 ${
                activeTab === idx 
                  ? 'bg-white/[0.12] shadow text-white'
                  : 'text-gray-400 hover:bg-white/[0.12] hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
        
        <div className="mt-2">
          {tabs.map((tab, idx) => (
            <div
              key={idx}
              className={`rounded-lg bg-white/5 p-6 ${activeTab === idx ? 'block' : 'hidden'}`}
            >
              {activeTab === 0 ? (
                <div className="space-y-4">
                  {competitors.map(competitor => (
                    <div 
                      key={competitor.id}
                      className="flex justify-between items-center bg-white/5 p-4 rounded-lg"
                    >
                      {editingId === competitor.id ? (
                        <div className="flex-1 mr-4">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 mb-2"
                            placeholder="Competitor name"
                          />
                          <input
                            type="url"
                            value={editForm.website_url || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, website_url: e.target.value }))}
                            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2"
                            placeholder="Website URL"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-medium">{competitor.name}</h3>
                          {competitor.website_url && (
                            <a 
                              href={competitor.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-400 hover:underline"
                            >
                              {competitor.website_url}
                            </a>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {editingId === competitor.id ? (
                          <>
                            <button
                              onClick={() => handleEditSubmit(competitor.id)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(competitor)}
                              className="p-2 text-gray-400 hover:text-blue-500"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(competitor.id)}
                              className="p-2 text-gray-400 hover:text-red-500"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <tab.component />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 