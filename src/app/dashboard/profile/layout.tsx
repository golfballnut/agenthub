'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      {children}
    </div>
  )
} 