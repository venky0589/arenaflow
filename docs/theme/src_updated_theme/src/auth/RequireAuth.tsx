import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface RequireAuthProps {
  children: React.ReactNode
  /**
   * Optional list of required roles.
   * If specified, user must have at least one of these roles to access.
   * If not specified, any authenticated user can access.
   */
  roles?: string[]
}

/**
 * Route guard component for authentication and authorization.
 *
 * Usage:
 * ```tsx
 * // Auth only (any authenticated user)
 * <RequireAuth><Dashboard /></RequireAuth>
 *
 * // Auth + role check (ADMIN only)
 * <RequireAuth roles={['ADMIN']}><AdminPage /></RequireAuth>
 *
 * // Auth + multiple roles (ADMIN or REFEREE)
 * <RequireAuth roles={['ADMIN', 'REFEREE']}><CheckInPage /></RequireAuth>
 * ```
 */
export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { isAuthenticated, hasAnyRole } = useAuth()
  const loc = useLocation()

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: loc }} replace />
  }

  // Check authorization (if roles specified)
  if (roles && roles.length > 0 && !hasAnyRole(...roles)) {
    return <Navigate to="/unauthorized" state={{ from: loc }} replace />
  }

  return <>{children}</>
}
