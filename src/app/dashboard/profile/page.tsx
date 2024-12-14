'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import Image from 'next/image'
import { UserIcon } from '@heroicons/react/24/outline'

interface Profile {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
  updated_at: string
}

export default function ProfileSettings() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!session?.user?.id) return

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error) throw error
        
        if (!data) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              full_name: session.user.name || session.user.email?.split('@')[0] || '',
              username: session.user.email?.split('@')[0] || '',
              avatar_url: null,
              updated_at: new Date().toISOString()
            }])
            .select()
            .single()

          if (insertError) throw insertError
          setProfile(newProfile)
        } else {
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, supabase])

  if (loading) return <div>Loading...</div>
  if (!profile) return <div>No profile found</div>

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <UserIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{profile?.full_name}</h2>
          <p className="text-gray-500">@{profile?.username}</p>
        </div>
      </div>
    </div>
  )
} 