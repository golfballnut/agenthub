'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PlusIcon } from '@heroicons/react/24/outline'

interface Team {
  id: string
  name: string
  created_at: string
  agents?: Agent[]
}

interface Agent {
  id: string
  team_id: string
  name: string
  created_at: string
}

export default function AgentsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Fetch teams and their agents
  const fetchTeams = async () => {
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          agents (*)
        `)
        .order('created_at', { ascending: false })

      if (teamsError) throw teamsError

      setTeams(teamsData || [])
    } catch (err) {
      console.error('Error fetching teams:', err)
      setError('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    try {
      const { error: insertError } = await supabase
        .from('teams')
        .insert([{ 
          name: newTeamName
        }])

      if (insertError) throw insertError

      setNewTeamName('')
      fetchTeams()
    } catch (err) {
      console.error('Error creating team:', err)
      setError('Failed to create team')
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse text-white/60">Loading teams...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">AI Agents & Teams</h1>
        <p className="mt-1 text-white/60">
          Create and manage your AI agent teams
        </p>
      </div>

      {/* Create Team Form */}
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Team</h2>
        <form onSubmit={handleCreateTeam} className="flex gap-4">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Enter team name"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFBE1A] focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-[#FFBE1A] text-black px-4 py-2 rounded-lg hover:bg-[#FFBE1A]/90 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Team
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      {/* Teams List */}
      <div className="space-y-6">
        {teams.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 rounded-xl p-6 text-center text-white/60">
            No teams created yet. Create your first team to get started.
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              className="bg-[#111111] border border-white/5 rounded-xl p-6"
            >
              <h3 className="text-lg font-medium text-white mb-4">
                {team.name}
              </h3>
              {team.agents && team.agents.length > 0 ? (
                <div className="space-y-3">
                  {team.agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#FFBE1A]/10 flex items-center justify-center">
                        <span className="text-[#FFBE1A]">AI</span>
                      </div>
                      <span className="text-white/80">{agent.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40">No agents in this team yet</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 