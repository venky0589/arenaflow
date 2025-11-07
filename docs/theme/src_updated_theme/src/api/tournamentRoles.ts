import api from './client'
import { TournamentRoleAssignment, RoleAssignmentRequest, TournamentRole } from '../types/tournamentRole'

export const tournamentRolesApi = {
  /**
   * Get all role assignments for a tournament
   */
  getAll: async (tournamentId: number): Promise<TournamentRoleAssignment[]> => {
    const response = await api.get(`/api/v1/tournaments/${tournamentId}/roles`)
    return response.data
  },

  /**
   * Assign a role to a user in a tournament
   */
  assign: async (tournamentId: number, request: RoleAssignmentRequest): Promise<TournamentRoleAssignment> => {
    const response = await api.post(`/api/v1/tournaments/${tournamentId}/roles`, request)
    return response.data
  },

  /**
   * Remove a role assignment
   */
  remove: async (tournamentId: number, assignmentId: number): Promise<void> => {
    await api.delete(`/api/v1/tournaments/${tournamentId}/roles/${assignmentId}`)
  },

  /**
   * Get users with a specific role in a tournament
   */
  getByRole: async (tournamentId: number, role: TournamentRole): Promise<TournamentRoleAssignment[]> => {
    const response = await api.get(`/api/v1/tournaments/${tournamentId}/roles/by-role/${role}`)
    return response.data
  },

  /**
   * Get the current user's roles in a specific tournament
   * Returns array of TournamentRole ('OWNER', 'ADMIN', 'STAFF', 'REFEREE')
   */
  getMyRoles: async (tournamentId: number): Promise<TournamentRole[]> => {
    const response = await api.get(`/api/v1/tournaments/${tournamentId}/roles/me`)
    return response.data
  }
}
