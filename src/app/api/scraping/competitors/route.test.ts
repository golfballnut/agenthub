import { GET, POST, DELETE } from './route'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn()
}))

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => []
  })
}))

describe('Competitors API Routes', () => {
  const mockUser = { id: 'test-user-id' }
  let mockSupabase: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup default mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn()
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('GET /api/scraping/competitors', () => {
    it('should fetch competitors successfully', async () => {
      const mockCompetitors = [
        { id: '1', name: 'Competitor 1', website_url: 'http://example1.com' },
        { id: '2', name: 'Competitor 2', website_url: 'http://example2.com' }
      ]

      mockSupabase.select.mockResolvedValue({ data: mockCompetitors, error: null })

      const response = await GET(new Request('http://localhost/api/scraping/competitors'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCompetitors)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const response = await GET(new Request('http://localhost/api/scraping/competitors'))
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/scraping/competitors', () => {
    it('should create a competitor successfully', async () => {
      const newCompetitor = {
        name: 'New Competitor',
        website_url: 'http://example.com'
      }

      mockSupabase.single.mockResolvedValue({
        data: { id: 'new-id', ...newCompetitor },
        error: null
      })

      const response = await POST(new Request('http://localhost/api/scraping/competitors', {
        method: 'POST',
        body: JSON.stringify(newCompetitor)
      }))

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: 'new-id',
        ...newCompetitor
      })
    })

    it('should return 400 if name is missing', async () => {
      const response = await POST(new Request('http://localhost/api/scraping/competitors', {
        method: 'POST',
        body: JSON.stringify({ website_url: 'http://example.com' })
      }))

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/scraping/competitors', () => {
    it('should delete a competitor successfully', async () => {
      mockSupabase.delete.mockResolvedValue({ error: null })

      const response = await DELETE(
        new Request('http://localhost/api/scraping/competitors?id=test-id')
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ success: true })
    })

    it('should return 400 if id is missing', async () => {
      const response = await DELETE(
        new Request('http://localhost/api/scraping/competitors')
      )

      expect(response.status).toBe(400)
    })
  })
}) 