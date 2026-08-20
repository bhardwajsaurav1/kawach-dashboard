import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const userStr = localStorage.getItem('kavachUser')
  if (!userStr) {
    return <Navigate to="/login" replace />
  }

  try {
    const user = JSON.parse(userStr)
    if (!user || !user.token) {
      return <Navigate to="/login" replace />
    }
  } catch (e) {
    return <Navigate to="/login" replace />
  }

  return children
}
