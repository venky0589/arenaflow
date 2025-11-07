/**
 * Authentication and authorization hook.
 * Provides access to current user's authentication state and role-based helpers.
 *
 * Example usage:
 * ```tsx
 * const { isAdmin, isReferee, hasAnyRole, userEmail } = useAuth()
 *
 * if (isAdmin) {
 *   // Show admin-only features
 * }
 *
 * if (hasAnyRole('ADMIN', 'REFEREE')) {
 *   // Show features for both admins and referees
 * }
 * ```
 */
export function useAuth() {
  const userEmail = localStorage.getItem('userEmail')
  const token = localStorage.getItem('token')
  const rolesJson = localStorage.getItem('userRoles')

  // Parse roles from localStorage (stored as JSON array)
  const roles: string[] = rolesJson ? JSON.parse(rolesJson) : []

  return {
    // Authentication state
    isAuthenticated: !!token,
    userEmail: userEmail || null,
    token: token || null,

    // Role information
    roles,
    isAdmin: roles.includes('SYSTEM_ADMIN'),
    isReferee: roles.includes('REFEREE'),
    isUser: roles.includes('USER'),

    /**
     * Check if user has any of the specified roles.
     * @param checkRoles - Roles to check
     * @returns true if user has at least one of the specified roles
     *
     * Example:
     * ```tsx
     * hasAnyRole('ADMIN', 'REFEREE') // true if user is ADMIN or REFEREE
     * ```
     */
    hasAnyRole: (...checkRoles: string[]): boolean => {
      return checkRoles.some(r => roles.includes(r))
    },

    /**
     * Check if user has all of the specified roles.
     * @param checkRoles - Roles to check
     * @returns true if user has all of the specified roles
     */
    hasAllRoles: (...checkRoles: string[]): boolean => {
      return checkRoles.every(r => roles.includes(r))
    }
  }
}
