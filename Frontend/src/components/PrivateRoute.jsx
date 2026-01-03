import { useAuth } from "../context/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // or loader

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
