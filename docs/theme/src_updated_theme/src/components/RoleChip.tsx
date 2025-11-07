import { Chip, Tooltip } from '@mui/material'
import { TournamentRole } from '../types/tournamentRole'

interface RoleChipProps {
  role: TournamentRole
  size?: 'small' | 'medium'
}

const roleColors: Record<TournamentRole, 'secondary' | 'primary' | 'success' | 'warning'> = {
  OWNER: 'secondary',    // Purple
  ADMIN: 'primary',      // Blue
  STAFF: 'success',      // Green
  REFEREE: 'warning'     // Orange
}

const roleDescriptions: Record<TournamentRole, string> = {
  OWNER: 'Full control over tournament, can assign all roles',
  ADMIN: 'Manage tournament operations, can assign STAFF/REFEREE',
  STAFF: 'Desk operations: check-in, registrations',
  REFEREE: 'Match scoring and status management'
}

export default function RoleChip({ role, size = 'small' }: RoleChipProps) {
  return (
    <Tooltip title={roleDescriptions[role]} arrow>
      <Chip
        label={role}
        color={roleColors[role]}
        size={size}
        sx={{ fontWeight: 'medium' }}
      />
    </Tooltip>
  )
}
