'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { ScrapingPageContent } from './scraping-page-content'

export default function ScrapingPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please sign in to access this page</div>
  }

  return <ScrapingPageContent />
} 