export type TournamentRole = 'OWNER' | 'ADMIN' | 'STAFF' | 'REFEREE'

export interface TournamentRoleAssignment {
  id: number
  tournamentId: number
  tournamentName: string
  userAccountId: number
  userEmail: string
  role: TournamentRole
  assignedById: number
  assignedByEmail: string
  assignedAt: string
}

export interface RoleAssignmentRequest {
  userId: number
  role: TournamentRole
}

export interface RoleAssignmentResponse extends TournamentRoleAssignment {}
