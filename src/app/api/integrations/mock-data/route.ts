import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const mockData = {
  netsuite: {
    products: [
      { id: 1, name: "Enterprise Software License", price: 999.99 },
      { id: 2, name: "Cloud Storage Plan", price: 199.99 },
      { id: 3, name: "Support Package", price: 299.99 },
    ]
  },
  clickup: {
    tasks: [
      { id: 1, title: "Implement OAuth", status: "In Progress" },
      { id: 2, title: "Update Documentation", status: "Todo" },
      { id: 3, title: "Fix Bug #123", status: "Done" },
    ]
  },
  hubspot: {
    contacts: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
      { id: 3, name: "Bob Wilson", email: "bob@example.com" },
    ]
  },
  youtube: {
    videos: [
      { id: "abc123", title: "Getting Started with Next.js", views: 15000, likes: 850 },
      { id: "def456", title: "React Server Components Tutorial", views: 12000, likes: 720 },
      { id: "ghi789", title: "Building with Supabase", views: 8500, likes: 490 },
    ]
  },
  brightdata: {
    proxies: [
      { id: "proxy-1", region: "US-East", status: "active", bandwidth: "1.2 GB" },
      { id: "proxy-2", region: "EU-West", status: "active", bandwidth: "0.8 GB" },
      { id: "proxy-3", region: "Asia-Pacific", status: "inactive", bandwidth: "0.5 GB" },
    ]
  }
}

export async function POST(request: Request) {
  try {
    const { source } = await request.json()
    
    if (!source) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      )
    }

    // Create supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return mock data for the requested source
    const sourceData = mockData[source.toLowerCase() as keyof typeof mockData]
    
    if (!sourceData) {
      return NextResponse.json(
        { error: 'No data available for this integration' },
        { status: 404 }
      )
    }

    return NextResponse.json(sourceData)
  } catch (error) {
    console.error('Mock data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mock data' },
      { status: 500 }
    )
  }
} 