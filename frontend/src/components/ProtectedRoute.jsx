import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    switch (user.role) {
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      case 'teacher': return <Navigate to="/teacher/dashboard" replace />;
      default: return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
}
