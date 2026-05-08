import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext";

import Login from "./pages/auth/Login";
import Dashboardde from "./pages/Developer/Dashboardde"; // Developer dashboard
import Dashboardma from "./pages/Manager/Dashboardma"; // Manager dashboard
import Dashboardle from "./pages/Team_Leader/Dashboardle"; // Team Leader dashboard
import ProtectedRoute from "./components/ProtectedRoute"; // Adjust path as needed
import ResetPassword from "./pages/auth/ResetPassword";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public login route */}
          <Route path="/" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes with role checks */}
          <Route
            path="/developer"
            element={
              <ProtectedRoute allowedRoles={["developer"]}>
                <Dashboardde />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <Dashboardma />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team_leader"
            element={
              <ProtectedRoute allowedRoles={["team_leader"]}>
                <Dashboardle />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;
