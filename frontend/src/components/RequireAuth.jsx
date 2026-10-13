import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireAuth({ children, adminOnly = false }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to={adminOnly ? '/admin' : '/login'}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}