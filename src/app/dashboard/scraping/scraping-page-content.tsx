'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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

export function ScrapingPageContent() {
  const { data: session } = useSession()
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
    if (session?.user?.id) {
      fetchCompetitors()
      fetchMetrics()
    }
  }, [session])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/scraping/metrics', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.id}`
        }
      })
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
      const response = await fetch('/api/scraping/competitors', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.id}`
        }
      })
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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.id}`
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
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.user?.id}`
        }
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
      {/* Rest of your JSX */}
    </div>
  )
} 