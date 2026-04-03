import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Role } from '../types/enums';
import { getAccessToken, getStoredUser } from '../utils/authStorage';

export type ProtectedRouteProps = {
  allowedRoles?: Role[];
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const token = getAccessToken();
  const user = getStoredUser();

  if (!token || !user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const roleName = user.role?.name?.toUpperCase() as Role | undefined;
    if (!roleName || !allowedRoles.includes(roleName)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
