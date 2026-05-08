import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, authReady } = useAuth();
  const location = useLocation();

  // ✅ Allow some routes to be accessed without login
  const publicPaths = ["/reset-password", "/forgot-password"];
  if (publicPaths.includes(location.pathname)) {
    return children;
  }
  if (!authReady) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  const role = user.role ? String(user.role).toLowerCase() : "";

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    switch (role) {
      case "manager":
        return <Navigate to="/manager" replace />;
      case "team_leader":
        return <Navigate to="/team_leader" replace />;
      case "developer":
        return <Navigate to="/developer" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
