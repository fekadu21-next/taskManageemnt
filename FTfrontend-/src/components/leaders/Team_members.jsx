import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiGrid, FiTable } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = "http://localhost:8000";

export default function TeamMembers() {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  const [teamMembers, setTeamMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [view, setView] = useState("table");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("You are not logged in.");
          return;
        }

        // Fetch team members
        const resMembers = await fetch(`${API_URL}/api/team-members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resMembers.ok) throw new Error(`Failed: ${resMembers.status}`);
        const membersData = await resMembers.json();
        setTeamMembers(membersData.members || []);

        //  Fetch roles
        const resRoles = await fetch(`${API_URL}/api/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resRoles.ok) throw new Error(`Failed roles: ${resRoles.status}`);
        const rolesData = await resRoles.json();
        setRoles(rolesData || []);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [token]);

  if (!user) return <div className="p-6">Loading user...</div>;
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading team members...</p>
      </div>
    );
  }
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const teamName = user?.team?.name || "N/A";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`p-2 rounded-xl ${
              view === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FiTable size={18} />
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`p-2 rounded-xl ${
              view === "kanban"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FiGrid size={18} />
          </button>
        </div>
      </div>

      {/* Table View */}
      {view === "table" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto  rounded-2xl"
        >
          <table className="min-w-full  rounded-2xl">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{member.id}</td>
                  <td className="px-4 py-3 font-medium">{member.name}</td>
                  <td className="px-4 py-3 text-gray-600">{member.email}</td>
                  <td className="px-4 py-3">{member.role}</td>
                  <td className="px-4 py-3">{member.team}</td>
                  <td
                    className={`px-4 py-3 ${
                      member.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {member.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Kanban View */}
      {/* Kanban View */}
      {view === "kanban" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-6"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              }}
              className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200 transition"
            >
              {/* ID */}
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-500 w-20">ID:</span>
                <span>{member.id}</span>
              </div>

              {/* Name with profile photo */}
              <div className="flex items-center gap-3 mb-2">
                {member.profile_photo && (
                  <img
                    src={member.profile_photo}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <span className="font-medium text-gray-500 w-20">Name:</span>
                <span>{member.name}</span>
              </div>

              {/* Email */}
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-500 w-20">Email:</span>
                <span>{member.email}</span>
              </div>

              {/* Role */}
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-500 w-20">Role:</span>
                <span>{member.role}</span>
              </div>

              {/* Team */}
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-500 w-20">Team:</span>
                <span>{member.team}</span>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-20">Status:</span>
                <span
                  className={`font-semibold ${
                    member.status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {member.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
