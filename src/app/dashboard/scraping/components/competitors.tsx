'use client'

import { useCompetitors } from '@/hooks/useCompetitors'
import { LinkIcon } from '@heroicons/react/24/outline'

export default function Competitors() {
  const { competitors, loading } = useCompetitors()

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!competitors?.length) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">No Competitors Yet</h2>
        <p className="text-gray-400">Start tracking your competitors to see them here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {competitors.map((competitor) => (
        <div 
          key={competitor.id}
          className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="font-medium">{competitor.name}</h3>
            {competitor.website_url && (
              <a 
                href={competitor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                <LinkIcon className="h-4 w-4" />
                {competitor.website_url}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 