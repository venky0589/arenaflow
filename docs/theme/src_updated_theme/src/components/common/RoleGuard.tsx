import { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface RoleGuardProps {
  /**
   * Required roles - user must have at least one of these roles
   */
  roles: string[]

  /**
   * Content to render if user has required role
   */
  children: ReactNode

  /**
   * Optional fallback content to render if user doesn't have required role
   * Default: null (renders nothing)
   */
  fallback?: ReactNode
}

/**
 * Conditional rendering component based on user roles.
 * Shows children if user has any of the required roles, otherwise shows fallback.
 *
 * Example usage:
 * ```tsx
 * <RoleGuard roles={['ADMIN']}>
 *   <Button>Admin Only Action</Button>
 * </RoleGuard>
 *
 * <RoleGuard roles={['ADMIN', 'REFEREE']} fallback={<Typography>Access denied</Typography>}>
 *   <CheckInButton />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { hasAnyRole } = useAuth()

  return hasAnyRole(...roles) ? <>{children}</> : <>{fallback}</>
}
