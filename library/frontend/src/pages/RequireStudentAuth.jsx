import { Navigate } from 'react-router-dom';
import { useStudentAuth } from '../StudentAuthContext';

export default function RequireStudentAuth({ children }) {
  const { student } = useStudentAuth();

  if (!student) {
    return <Navigate to="/student-login" replace />;
  }

  return children;
}