import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import { useTournamentManagePermission } from '../useTournamentManagePermission'
import type { TournamentRole } from '../../types/tournamentRole'

// Mock useAuth hook - must be defined before vi.mock call
vi.mock('../useAuth', () => {
  const mockUseAuth = vi.fn(() => ({
    isAdmin: false,
    isReferee: false,
    isUser: true,
    roles: ['USER'],
    userEmail: 'user@example.com',
    hasAnyRole: vi.fn(),
    hasAllRoles: vi.fn(),
  }))

  return {
    useAuth: mockUseAuth,
  }
})

// Get the mocked function to allow overriding in tests
import { useAuth } from '../useAuth'
const mockUseAuth = vi.mocked(useAuth)

// Start MSW server before tests
beforeAll(() => server.listen())

// Reset mocks before each test to prevent test pollution
beforeEach(() => {
  // Reset useAuth mock to default (non-admin user)
  mockUseAuth.mockReturnValue({
    isAdmin: false,
    isReferee: false,
    isUser: true,
    roles: ['USER'],
    userEmail: 'user@example.com',
    hasAnyRole: vi.fn(),
    hasAllRoles: vi.fn(),
  } as any)
})

afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useTournamentManagePermission', () => {
  describe('SYSTEM_ADMIN Bypass', () => {
    it('returns canManage: true for SYSTEM_ADMIN without API call', async () => {
      // Override mock for this test - set isAdmin = true
      mockUseAuth.mockReturnValue({
        isAdmin: true,
        isReferee: false,
        isUser: false,
        roles: ['SYSTEM_ADMIN'],
        userEmail: 'admin@example.com',
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      } as any)

      const { result } = renderHook(() => useTournamentManagePermission(1))

      // Should immediately return canManage: true without waiting
      expect(result.current.canManage).toBe(true)
      expect(result.current.loading).toBe(false)
      expect(result.current.roles).toEqual([])
    })
  })

  describe('Tournament OWNER/ADMIN Roles', () => {
    it('returns canManage: true for tournament OWNER', async () => {
      // Mock API to return OWNER role - use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/101/roles/me', () => {
          const roles: TournamentRole[] = ['OWNER']
          return HttpResponse.json(roles)
        })
      )

      const { result } = renderHook(() => useTournamentManagePermission(101))

      // Should be loading initially
      expect(result.current.loading).toBe(true)

      // Wait for API call to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.canManage).toBe(true)
      expect(result.current.roles).toEqual(['OWNER'])
    })

    it('returns canManage: true for tournament ADMIN', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/102/roles/me', () => {
          const roles: TournamentRole[] = ['ADMIN']
          return HttpResponse.json(roles)
        })
      )

      const { result } = renderHook(() => useTournamentManagePermission(102))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.canManage).toBe(true)
      expect(result.current.roles).toEqual(['ADMIN'])
    })

    it('returns canManage: true for user with both OWNER and ADMIN roles', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/103/roles/me', () => {
          const roles: TournamentRole[] = ['OWNER', 'ADMIN']
          return HttpResponse.json(roles)
        })
      )

      const { result } = renderHook(() => useTournamentManagePermission(103))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.canManage).toBe(true)
      expect(result.current.roles).toEqual(['OWNER', 'ADMIN'])
    })
  })

  describe('Read-Only Roles (STAFF, REFEREE, No Role)', () => {
    it('returns canManage: false for tournament STAFF', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/201/roles/me', () => {
          const roles: TournamentRole[] = ['STAFF']
          return HttpResponse.json(roles)
        })
      )

      const { result } = renderHook(() => useTournamentManagePermission(201))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.canManage).toBe(false)
      expect(result.current.roles).toEqual(['STAFF'])
    })

    it('returns canManage: false for tournament REFEREE', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/202/roles/me', () => {
          const roles: TournamentRole[] = ['REFEREE']
          return HttpResponse.json(roles)
        })
      )

      const { result } = renderHook(() => useTournamentManagePermission(202))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.canManage).toBe(false)
      expect(result.current.roles).toEqual(['REFEREE'])
    })

    it('returns canManage: false when user has no tournament role', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/203/roles/me', () => {
          const roles: TournamentRole[] = []
          return HttpResponse.json(roles)
        })
      )

      const { result } = renderHook(() => useTournamentManagePermission(203))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.canManage).toBe(false)
      expect(result.current.roles).toEqual([])
    })
  })

  describe('Null/Undefined Tournament ID', () => {
    it('returns canManage: false when tournamentId is null', async () => {
      const { result } = renderHook(() => useTournamentManagePermission(null))

      expect(result.current.canManage).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.roles).toEqual([])
    })

    it('returns canManage: false when tournamentId is undefined', async () => {
      const { result } = renderHook(() => useTournamentManagePermission(undefined))

      expect(result.current.canManage).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.roles).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('returns canManage: false on API error (safe default)', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/301/roles/me', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useTournamentManagePermission(301))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.canManage).toBe(false)
      expect(result.current.roles).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('returns canManage: false on 403 Forbidden', async () => {
      // Use unique tournament ID to avoid cache collision
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/302/roles/me', () => {
          return new HttpResponse(null, { status: 403 })
        })
      )

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useTournamentManagePermission(302))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.canManage).toBe(false)
      expect(result.current.roles).toEqual([])

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Caching Behavior', () => {
    it('caches permission result for 30 seconds (no duplicate API calls)', async () => {
      let apiCallCount = 0

      // Use unique tournament ID to avoid cache collision with other tests
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/401/roles/me', () => {
          apiCallCount++
          const roles: TournamentRole[] = ['OWNER']
          return HttpResponse.json(roles)
        })
      )

      // First render - should call API
      const { result: result1, unmount } = renderHook(() => useTournamentManagePermission(401))
      await waitFor(() => expect(result1.current.loading).toBe(false))

      // Note: StrictMode or test environment may cause double renders
      // Accept 1 or 2 API calls for first render (due to React StrictMode double-invocation)
      const firstCallCount = apiCallCount
      expect(firstCallCount).toBeGreaterThanOrEqual(1)
      expect(result1.current.canManage).toBe(true)

      // Unmount first hook instance
      unmount()

      // Second render within 30 seconds - should use cache (no new API call)
      const { result: result2 } = renderHook(() => useTournamentManagePermission(401))

      // Should immediately resolve from cache (no loading state)
      await waitFor(() => expect(result2.current.loading).toBe(false))

      // The key test: no additional API calls beyond the first render
      expect(apiCallCount).toBe(firstCallCount)
      expect(result2.current.canManage).toBe(true)
    })
  })

  describe('Hook Updates on Tournament Change', () => {
    it('fetches new permissions when tournamentId changes', async () => {
      server.use(
        http.get('http://localhost:8080/api/v1/tournaments/1/roles/me', () => {
          return HttpResponse.json(['OWNER'])
        }),
        http.get('http://localhost:8080/api/v1/tournaments/2/roles/me', () => {
          return HttpResponse.json(['STAFF'])
        })
      )

      const { result, rerender } = renderHook(
        ({ tid }) => useTournamentManagePermission(tid),
        { initialProps: { tid: 1 } }
      )

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.canManage).toBe(true)
      expect(result.current.roles).toEqual(['OWNER'])

      // Change tournament ID
      rerender({ tid: 2 })

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.canManage).toBe(false) // STAFF has no manage permission
      expect(result.current.roles).toEqual(['STAFF'])
    })
  })
})
