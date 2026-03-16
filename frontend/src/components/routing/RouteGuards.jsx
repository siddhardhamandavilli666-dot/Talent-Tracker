import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export const RoleRoute = ({ children, roles }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userProfile && !roles.includes(userProfile.role)) {
    const dashboardMap = {
      student: '/dashboard/student',
      organization: '/dashboard/organization',
      admin: '/dashboard/admin',
    };
    return <Navigate to={dashboardMap[userProfile.role] || '/'} replace />;
  }

  return children;
};
