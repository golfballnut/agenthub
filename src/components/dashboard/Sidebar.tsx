'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ChartBarIcon,
  UserCircleIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  Square3Stack3DIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Agents', href: '/dashboard/agents', icon: UserCircleIcon },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Square3Stack3DIcon },
  { name: 'Scraping', href: '/dashboard/scraping', icon: CommandLineIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-[#111111] border-r border-white/5">
      <nav className="mt-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 