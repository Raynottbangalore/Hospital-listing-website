import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  return currentUser ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};
