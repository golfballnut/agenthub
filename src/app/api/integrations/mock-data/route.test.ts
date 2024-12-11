import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { POST } from './route'

// Mock the dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn()
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

describe('Mock Data API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } },
          error: null,
        }),
      },
    }
    ;(createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('returns 400 if source is missing', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Source is required')
  })

  it('returns mock data for valid source', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ source: 'hubspot' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.contacts).toBeDefined()
    expect(Array.isArray(data.contacts)).toBe(true)
  })

  it('returns 401 if user is not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    }
    ;(createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase)

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ source: 'hubspot' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })
}) 