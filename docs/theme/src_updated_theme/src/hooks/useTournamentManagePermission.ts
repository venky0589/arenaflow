import { useEffect, useState, useCallback } from 'react'
import { tournamentRolesApi } from '../api/tournamentRoles'
import { useAuth } from './useAuth'
import type { TournamentRole } from '../types/tournamentRole'

interface PermissionCache {
  roles: TournamentRole[]
  timestamp: number
}

// Cache storage for permission results (30 seconds TTL)
const permissionCache = new Map<number, PermissionCache>()
const CACHE_TTL_MS = 30 * 1000 // 30 seconds

/**
 * useTournamentManagePermission Hook
 *
 * Checks if the current user can manage (create/edit/delete) resources in a specific tournament.
 *
 * Permission Rules:
 * - SYSTEM_ADMIN: Always has manage permission (bypasses API check)
 * - Tournament OWNER: Has manage permission
 * - Tournament ADMIN: Has manage permission
 * - Tournament STAFF: No manage permission (read-only)
 * - Tournament REFEREE: No manage permission (read-only)
 * - No tournament role: No manage permission (read-only)
 *
 * Features:
 * - Caches results for 30 seconds to reduce API calls
 * - Auto-returns true for SYSTEM_ADMIN without API call
 * - Returns loading state during API fetch
 * - Handles errors gracefully (defaults to no permission)
 *
 * @param tournamentId - The tournament ID to check permissions for (null = no check)
 * @returns { canManage, loading, roles } - Permission status, loading state, and user's tournament roles
 *
 * @example
 * const { canManage, loading } = useTournamentManagePermission(selectedTournament?.id)
 *
 * if (loading) return <CircularProgress />
 * if (!canManage) return <Alert>Read-only access</Alert>
 */
export function useTournamentManagePermission(tournamentId: number | null | undefined) {
  const { isAdmin } = useAuth()
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<TournamentRole[]>([])

  const checkPermission = useCallback(async (tid: number) => {
    // Check cache first
    const cached = permissionCache.get(tid)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      const hasManageRole = cached.roles.includes('OWNER') || cached.roles.includes('ADMIN')
      setRoles(cached.roles)
      setCanManage(hasManageRole)
      setLoading(false)
      return
    }

    // Fetch from API
    setLoading(true)
    try {
      const userRoles = await tournamentRolesApi.getMyRoles(tid)

      // Cache the result
      permissionCache.set(tid, {
        roles: userRoles,
        timestamp: Date.now()
      })

      const hasManageRole = userRoles.includes('OWNER') || userRoles.includes('ADMIN')
      setRoles(userRoles)
      setCanManage(hasManageRole)
    } catch (error) {
      console.error('Failed to fetch tournament roles:', error)
      // On error, default to no permission (safe default)
      setRoles([])
      setCanManage(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // SYSTEM_ADMIN always has manage permission (bypass API check)
    if (isAdmin) {
      setCanManage(true)
      setLoading(false)
      setRoles([]) // System admin doesn't need tournament-specific roles
      return
    }

    // No tournament selected = no permission
    if (!tournamentId) {
      setCanManage(false)
      setLoading(false)
      setRoles([])
      return
    }

    // Check tournament-specific permissions
    checkPermission(tournamentId)
  }, [tournamentId, isAdmin, checkPermission])

  return {
    canManage,
    loading,
    roles
  }
}
