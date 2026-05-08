import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [newTasksCount, setNewTasksCount] = useState(0); // ✅ Add this
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCount = localStorage.getItem("newTasksCount"); // ✅ Load count
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCount) setNewTasksCount(Number(storedCount));
    setAuthReady(true);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("newTasksCount", data.new_tasks_count); // ✅ Store
      setUser(data.user);
      setNewTasksCount(data.new_tasks_count); // ✅ Update state

      switch (data.user.role?.toLowerCase()) {
        case "manager":
          navigate("/manager");
          break;
        case "team_leader":
          navigate("/team_leader");
          break;
        case "developer":
          navigate("/developer");
          break;
        default:
          navigate("/");
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("newTasksCount"); // ✅ Remove
      setUser(null);
      setNewTasksCount(0); // ✅ Reset
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      const mergedUser = { ...prevUser, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  const value = {
    user,
    login,
    logout,
    setUser: updateUser,
    newTasksCount, // ✅ expose
    setNewTasksCount, // ✅ optional, if needed
    authReady,
  };

  return (
    <AuthContext.Provider value={value}>
      {authReady ? (
        children
      ) : (
        <div>
          <i>Loading...</i>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
