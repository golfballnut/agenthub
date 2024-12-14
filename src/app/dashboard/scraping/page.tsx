'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ChartBarIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline'
import Competitors from './components/competitors'

// Placeholder stats
const stats = [
  { name: 'Total Competitors', value: '-- ', icon: ChartBarIcon },
  { name: 'Active Conditions', value: '-- ', icon: TagIcon },
  { name: 'Last Scan', value: '-- ', icon: ClockIcon },
]

const tabs = [
  { name: 'Competitors', component: Competitors },
  { name: 'Conditions', component: () => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">Scraping Conditions</h2>
      <p className="text-gray-400">Set up automated scraping rules and conditions (Coming Soon)</p>
    </div>
  )},
  { name: 'Product Matches', component: () => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">Product Match Analysis</h2>
      <p className="text-gray-400">Track matching products across competitors (Coming Soon)</p>
    </div>
  )}
]

export default function ScrapingPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState(0)

  if (status === "loading") return <div>Loading...</div>
  if (!session) return <div>Please sign in to access this page</div>

  const ActiveComponent = tabs[activeTab].component

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white/5 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <stat.icon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(index)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${index === activeTab
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <ActiveComponent />
    </div>
  )
} 