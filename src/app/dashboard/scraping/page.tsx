'use client'

import React from 'react'
import { useSession } from 'next-auth/react'

export default function ScrapingPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please sign in to access this page</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold mb-4">Scraping Dashboard</h1>
      <p className="text-xl text-gray-400">Coming Soon</p>
      <p className="mt-2 text-gray-500">We're working on bringing you powerful scraping capabilities.</p>
    </div>
  )
} 