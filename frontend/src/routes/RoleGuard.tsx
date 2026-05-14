import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";

interface RoleGuardProps {
  role: UserRole | UserRole[];
}

export function RoleGuard({ role }: RoleGuardProps) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.rol)) return <Navigate to="/login" replace />;

  return <Outlet />;
}
