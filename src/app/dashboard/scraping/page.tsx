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
    // Implement edit functionality
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    // Implement edit submit functionality
  }

  const handleDelete = async (id: string) => {
    // Implement delete functionality
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
              <tab.component />
            </div>
          ))}
        </div>

        {/* Competitors List with Edit */}
        <div className="grid gap-4 mt-4">
          {competitors.map(competitor => (
            <div 
              key={competitor.id}
              className="flex justify-between items-center bg-white/5 p-4 rounded-lg"
            >
              {/* Implement edit form or button */}
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
              <div className="flex gap-2">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 