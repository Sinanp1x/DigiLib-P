import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
