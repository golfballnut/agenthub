'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Competitor {
  id: string
  name: string
  website_url: string | null
  created_at: string
}

export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompetitors() {
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

    fetchCompetitors()
  }, [])

  return { competitors, loading }
} 