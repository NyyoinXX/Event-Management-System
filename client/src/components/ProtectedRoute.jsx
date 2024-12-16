import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../UserContext';

export default function ProtectedRoute({ children, requireAuth, redirectTo = '/' }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  // For auth pages (login/register), redirect to home if already logged in
  if (!requireAuth && user) {
    return <Navigate to={redirectTo} />;
  }

  // For protected pages, redirect to login if not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }

  return children;
} 