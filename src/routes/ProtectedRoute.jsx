import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};
