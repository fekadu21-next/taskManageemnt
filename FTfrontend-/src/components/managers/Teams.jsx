import React, { useState, useEffect } from "react";

import { FiEdit, FiTrash2, FiUsers, FiPlus } from "react-icons/fi";
const API_URL = "http://127.0.0.1:8000";
export default function Teams() {
  const token = localStorage.getItem("access_token");
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    leader_id: "",
  });
  const [editTeam, setEditTeam] = useState(null);
  const [editData, setEditData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Fetch teams from API

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/userr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTeams();
      fetchUsers(); // ✅ also fetch users
    }
  }, [token]);

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Fetched Teams JSON:", data);
      setTeams(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) fetchTeams();
  }, [token]);
  // Filter teams by search
  const filteredTeams = teams.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.leader && t.leader.toLowerCase().includes(search.toLowerCase()))
  );
  // Add Team
  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTeam),
      });

      if (!res.ok) throw new Error("Failed to add team");

      const data = await res.json();
      setTeams([...teams, data]);
      setShowAddModal(false);
      setNewTeam({ name: "", description: "", leader_id: "" });
      setMessage("Team added successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to add team");
    }
  };

  // Edit Team
  const handleEditClick = (team) => {
    setEditTeam(team);
    setEditData({
      name: team.name,
      description: team.description,
      leader_id: team.leader_id || "", // ✅ set current leader
    });
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/teams/${editTeam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData), // ✅ includes leader_id
      });
      const data = await res.json();
      setTeams(teams.map((t) => (t.id === editTeam.id ? data : t)));
      setEditTeam(null);
      setMessage("Team updated successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to update team");
    }
  };

  // Delete Team
  const handleDeleteTeam = async () => {
    try {
      await fetch(`${API_URL}/api/teams/${showDeleteModal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(teams.filter((t) => t.id !== showDeleteModal.id));
      setMessage("Team deleted successfully");
      setShowDeleteModal(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete team");
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading teams...</p>
      </div>
    );
  }
  return (
    <div className="p-6">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold"></h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-500 flex items-center gap-2 text-white  cursor-pointer px-4 py-2 rounded-lg shadow hover:bg-gray-700"
        >
          <FiPlus /> Create Team
        </button>
      </div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search team or leader..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded-xl mb-4 w-1/3 -mt-24"
      />
      {/* Teams Table */}
      <div className="overflow-x-auto  rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
              <th className="px-4 py-3">Team Name</th>
              <th className="px-4 py-3">Leader</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              <tr
                key={team.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">{team.name}</td>
                <td className="px-4 py-3">{team.leader || "—"}</td>
                <td className="px-4 py-3 text-sm">{team.description || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setShowMembersModal(team)}
                    className="flex items-center gap-1 text-blue-600 cursor-pointer hover:text-teal-600"
                  >
                    <FiUsers /> View Members ({team.members?.length || 0})
                  </button>
                </td>
                <td className="px-4 py-3 flex space-x-2">
                  {/* Edit with hover label */}
                  <div className="relative group">
                    <button
                      onClick={() => handleEditClick(team)}
                      className="p-2 bg-yellow-100 text-yellow-700 rounded cursor-pointer hover:bg-yellow-200"
                    >
                      <FiEdit />
                    </button>
                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-1 opacity-0 group-hover:opacity-100 transition">
                      Edit
                    </span>
                  </div>
                  {/* Delete with hover label */}
                  <div className="relative group">
                    <button
                      onClick={() => setShowDeleteModal(team)}
                      className="p-2 bg-red-100 text-red-700 rounded cursor-pointer hover:bg-red-200"
                    >
                      <FiTrash2 />
                    </button>
                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-1 opacity-0 group-hover:opacity-100 transition">
                      Delete
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create Team</h2>
            <form onSubmit={handleAddTeam} className="space-y-3">
              <input
                type="text"
                placeholder="Team Name"
                required
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                placeholder="Description"
                value={newTeam.description}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              {/* 🔹 Leader Dropdown */}
              <select
                value={newTeam.leader_id}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, leader_id: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Leader</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Team Modal */}

      {editTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Team</h2>
            <form onSubmit={handleUpdateTeam} className="space-y-3">
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              {/* 🔹 Leader Dropdown */}
              <select
                value={editData.leader_id}
                onChange={(e) =>
                  setEditData({ ...editData, leader_id: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Leader</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditTeam(null)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100 text-sm text-left">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {showMembersModal.members?.length > 0 ? (
                  showMembersModal.members.map((member) => (
                    <tr key={member.id} className="border-t">
                      <td className="px-3 py-2">{member.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {member.email}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center text-gray-500 py-2">
                      No members
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowMembersModal(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className=" fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Delete Team</h2>
            <p className="mb-4">
              Are you sure you want to delete team{" "}
              <strong>{showDeleteModal.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
