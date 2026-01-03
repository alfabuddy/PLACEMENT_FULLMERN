import { useAuth } from "../context/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // 🔥 If user already logged in → dashboard
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
