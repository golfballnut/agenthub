'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
  scraping_targets: Target[]
}

interface Target {
  id: string
  category_id: string
  url: string
  notes: string | null
  created_at: string
}

export default function ScrapingPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showNewTarget, setShowNewTarget] = useState<string | null>(null) // category_id or null
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient()

  // Form states
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [newTargetUrl, setNewTargetUrl] = useState('')
  const [newTargetNotes, setNewTargetNotes] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('scraping_categories')
        .select(`
          *,
          scraping_targets (*)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setSaving(true)
    try {
      const response = await fetch('/api/scraping/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName,
          description: newCategoryDesc,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create category')
      }

      setNewCategoryName('')
      setNewCategoryDesc('')
      setShowNewCategory(false)
      fetchCategories()
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTarget = async (categoryId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!newTargetUrl.trim()) return

    setSaving(true)
    try {
      const response = await fetch('/api/scraping/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: categoryId,
          url: newTargetUrl,
          notes: newTargetNotes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create target')
      }

      setNewTargetUrl('')
      setNewTargetNotes('')
      setShowNewTarget(null)
      fetchCategories()
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create target')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTarget = async (targetId: string) => {
    if (!confirm('Are you sure you want to delete this target?')) return

    try {
      const response = await fetch(`/api/scraping/targets?id=${targetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete target')
      }

      fetchCategories()
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete target')
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse text-white/60">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Web Scraping</h1>
          <p className="mt-1 text-white/60">
            Manage your scraping categories and targets
          </p>
        </div>
        <button
          onClick={() => setShowNewCategory(true)}
          className="bg-[#FFBE1A] text-black px-4 py-2 rounded-lg hover:bg-[#FFBE1A]/90 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Category
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      {/* New Category Form */}
      {showNewCategory && (
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-4">Create New Category</h2>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40"
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40"
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowNewCategory(false)}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#FFBE1A] text-black px-4 py-2 rounded-lg hover:bg-[#FFBE1A]/90 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  'Create Category'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-6">
        {categories.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 rounded-xl p-6 text-center text-white/60">
            No categories yet. Create your first category to get started.
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-[#111111] border border-white/5 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-white/60">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNewTarget(category.id)}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-white/5 text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Target
                  </button>
                </div>
              </div>

              {/* New Target Form */}
              {showNewTarget === category.id && (
                <div className="mb-6 pt-4 border-t border-white/5">
                  <form onSubmit={(e) => handleCreateTarget(category.id, e)} className="space-y-4">
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-white mb-2">
                        URL
                      </label>
                      <input
                        type="url"
                        id="url"
                        value={newTargetUrl}
                        onChange={(e) => setNewTargetUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40"
                        placeholder="Enter target URL"
                      />
                    </div>
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-white mb-2">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        value={newTargetNotes}
                        onChange={(e) => setNewTargetNotes(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40"
                        placeholder="Enter notes about this target"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setShowNewTarget(null)}
                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-white/5 text-white hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#FFBE1A] text-black px-4 py-2 rounded-lg hover:bg-[#FFBE1A]/90 transition-colors flex items-center gap-2"
                      >
                        {saving ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          'Add Target'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Targets List */}
              {category.scraping_targets && category.scraping_targets.length > 0 ? (
                <div className="space-y-3">
                  {category.scraping_targets.map((target) => (
                    <div
                      key={target.id}
                      className="flex items-start justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div>
                        <a
                          href={target.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FFBE1A] hover:underline"
                        >
                          {target.url}
                        </a>
                        {target.notes && (
                          <p className="mt-1 text-sm text-white/60">{target.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTarget(target.id)}
                        className="text-white/40 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40">No targets in this category yet</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 