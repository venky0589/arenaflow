import { Navigate, useLocation } from 'react-router-dom'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  const loc = useLocation()
  if (!token) {
    return <Navigate to="/login" state={{ from: loc }} replace />
  }
  return <>{children}</>
}
