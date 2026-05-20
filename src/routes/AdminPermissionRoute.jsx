import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AdminPermissionRoute = ({ permissionKey, requireSuperAdmin }) => {
  const { userRole, userPermissions } = useAuth();

  if (userRole === "super_admin") {
    return <Outlet />;
  }

  if (requireSuperAdmin && userRole !== "super_admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permissionKey && (!userPermissions || !userPermissions[permissionKey])) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
