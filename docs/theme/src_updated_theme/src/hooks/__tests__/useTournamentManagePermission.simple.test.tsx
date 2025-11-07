import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import type { TournamentRole } from '../../types/tournamentRole'

// Mock the useAuth hook at the module level
const mockUseAuth = vi.fn()
vi.mock('../useAuth', () => ({
  useAuth: () => mockUseAuth()
}))

// Import the hook AFTER mocking
import { useTournamentManagePermission } from '../useTournamentManagePermission'

describe('useTournamentManagePermission (Simplified)', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseAuth.mockReturnValue({
      isAdmin: false,
      isReferee: false,
      isUser: true,
      roles: ['USER'],
      userEmail: 'user@example.com',
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
    })
  })

  describe('SYSTEM_ADMIN Bypass', () => {
    it('returns canManage: true for SYSTEM_ADMIN without loading', () => {
      mockUseAuth.mockReturnValue({
        isAdmin: true,
        isReferee: false,
        isUser: false,
        roles: ['SYSTEM_ADMIN'],
        userEmail: 'admin@example.com',
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      })

      // Use unique tournament ID to avoid cache collision
      const { result } = renderHook(() => useTournamentManagePermission(501))

      // Should immediately return canManage: true
      expect(result.current.canManage).toBe(true)
      expect(result.current.loading).toBe(false)
      expect(result.current.roles).toEqual([])
    })
  })

  describe('Tournament OWNER Role', () => {
    it('returns canManage: true for tournament OWNER', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/502/roles/me', () => {
          const roles: TournamentRole[] = ['OWNER']
          return HttpResponse.json(roles)
        })
      )

      const { result } = renderHook(() => useTournamentManagePermission(502))

      // Wait for API call to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 3000 })

      expect(result.current.canManage).toBe(true)
      expect(result.current.roles).toContain('OWNER')
    })
  })

  describe('Null Tournament ID', () => {
    it('returns canManage: false when tournamentId is null', () => {
      const { result } = renderHook(() => useTournamentManagePermission(null))

      expect(result.current.canManage).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.roles).toEqual([])
    })
  })

  describe('API Error Handling', () => {
    it('returns canManage: false on 500 error', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/503/roles/me', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useTournamentManagePermission(503))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 3000 })

      expect(result.current.canManage).toBe(false)
      expect(result.current.roles).toEqual([])

      consoleErrorSpy.mockRestore()
    })
  })
})
