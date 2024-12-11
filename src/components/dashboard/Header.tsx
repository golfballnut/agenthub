'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import {
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <header className="h-16 border-b border-white/5 bg-[#111111]">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-x-4">
          <div className="text-xl font-semibold text-white">
            Dashboard
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-6 w-6" />
            )}
            <span>{profile?.full_name || 'User'}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#111111] py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <button
                onClick={handleSignOut}
                className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 