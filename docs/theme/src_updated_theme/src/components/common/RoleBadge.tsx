import { Chip, Tooltip } from '@mui/material'
import { useAuth } from '../../hooks/useAuth'

/**
 * Displays the current user's primary role as a badge.
 * Shows role name with appropriate color coding:
 * - ADMIN: Red (error color)
 * - REFEREE: Orange (warning color)
 * - USER: Default gray
 *
 * Tooltip shows user email and all roles.
 *
 * Example usage:
 * ```tsx
 * <AppBar>
 *   <Toolbar>
 *     <Typography>App Name</Typography>
 *     <RoleBadge />
 *   </Toolbar>
 * </AppBar>
 * ```
 */
export function RoleBadge() {
  const { userEmail, roles, isAdmin, isReferee } = useAuth()

  // Don't render if not authenticated
  if (!userEmail || roles.length === 0) {
    return null
  }

  // Determine badge color and label based on highest priority role
  const roleColor = isAdmin ? 'error' : isReferee ? 'warning' : 'default'
  const roleLabel = isAdmin ? 'ADMIN' : isReferee ? 'REFEREE' : 'USER'

  // Tooltip content with all roles
  const tooltipContent = `${userEmail} • ${roles.join(', ')}`

  return (
    <Tooltip title={tooltipContent} arrow>
      <Chip
        label={roleLabel}
        color={roleColor}
        size="small"
        sx={{
          ml: 2,
          fontWeight: 600,
          cursor: 'default'
        }}
      />
    </Tooltip>
  )
}
