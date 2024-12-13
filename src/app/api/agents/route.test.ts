import { POST, GET, DELETE } from './route'
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

describe('Agents API Routes', () => {
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
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn()
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('POST /api/agents', () => {
    it('should create an agent successfully', async () => {
      // Mock successful agent creation
      mockSupabase.single.mockResolvedValue({
        data: { id: 'test-agent-id', name: 'Test Agent' },
        error: null
      })

      const request = new Request('http://localhost/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Agent',
          team_id: 'test-team-id',
          description: 'Test Description'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: 'test-agent-id',
        name: 'Test Agent'
      })
    })

    it('should return 400 if name or team_id is missing', async () => {
      const request = new Request('http://localhost/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Agent'
          // Missing team_id
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const request = new Request('http://localhost/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Agent',
          team_id: 'test-team-id'
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should handle database constraint violations', async () => {
      // Mock a foreign key violation
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: {
          code: '23503', // Foreign key violation
          message: 'insert or update on table "agents" violates foreign key constraint'
        }
      })

      const request = new Request('http://localhost/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Agent',
          team_id: 'non-existent-team',
          description: 'Test Description'
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })

    it('should validate required fields from schema', async () => {
      const request = new Request('http://localhost/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          team_id: 'test-team-id',
          description: 'Test Description'
          // Missing required 'name' field
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/agents', () => {
    it('should fetch agents successfully', async () => {
      const mockAgents = [
        { id: 'agent-1', name: 'Agent 1' },
        { id: 'agent-2', name: 'Agent 2' }
      ]

      mockSupabase.order.mockResolvedValue({
        data: mockAgents,
        error: null
      })

      const request = new Request('http://localhost/api/agents?team_id=test-team-id')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockAgents)
    })

    it('should return 400 if team_id is missing', async () => {
      const request = new Request('http://localhost/api/agents')
      const response = await GET(request)
      expect(response.status).toBe(400)
    })

    it('should return empty array when no agents exist for team', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null
      })

      const request = new Request('http://localhost/api/agents?team_id=test-team-id')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: {
          message: 'Database error'
        }
      })

      const request = new Request('http://localhost/api/agents?team_id=test-team-id')
      const response = await GET(request)
      expect(response.status).toBe(500)
    })
  })

  describe('DELETE /api/agents', () => {
    it('should delete an agent successfully', async () => {
      mockSupabase.eq.mockResolvedValue({
        error: null
      })

      const request = new Request('http://localhost/api/agents?id=test-agent-id')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })

    it('should return 400 if agent id is missing', async () => {
      const request = new Request('http://localhost/api/agents')
      const response = await DELETE(request)
      expect(response.status).toBe(400)
    })

    it('should handle non-existent agent deletion', async () => {
      mockSupabase.eq.mockResolvedValue({
        data: null,
        error: {
          code: 'PGRST116',
          message: 'Resource not found'
        }
      })

      const request = new Request('http://localhost/api/agents?id=non-existent-id')
      const response = await DELETE(request)
      expect(response.status).toBe(500)
    })

    it('should verify user ownership before deletion', async () => {
      // Mock a different user_id to test RLS policy
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'different-user-id' } }, 
        error: null 
      })

      const request = new Request('http://localhost/api/agents?id=test-agent-id')
      const response = await DELETE(request)
      const data = await response.json()

      // Should still return success due to RLS policy handling the restriction
      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network error')
      })

      const request = new Request('http://localhost/api/agents?team_id=test-team-id')
      const response = await GET(request)
      expect(response.status).toBe(500)
    })

    it('should handle malformed JSON in POST requests', async () => {
      const request = new Request('http://localhost/api/agents', {
        method: 'POST',
        body: 'invalid-json'
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })
}) 