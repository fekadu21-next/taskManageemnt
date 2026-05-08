import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FiTrash2, FiRefreshCcw, FiUserPlus, FiEdit } from "react-icons/fi";
const API_URL = "http://127.0.0.1:8000";
export default function Users() {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role_id: "",
    team_id: "",
    password: "",
  });
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role_id: "",
    team_id: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // --- Fetch helper ---
  const fetchData = async (url, setter) => {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setter(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!token) return;
    fetchData(`${API_URL}/api/users`, setUsers);
    fetchData(`${API_URL}/api/roles`, setRoles);
    fetchData(`${API_URL}/api/teams`, setTeams);
  }, [token]);

  // --- Filter users ---
  const filteredUsers = users.filter((u) => {
    const searchLower = search.toLowerCase();

    // Search by name or email
    const matchesSearch =
      !searchLower ||
      (u.name && u.name.toLowerCase().startsWith(searchLower)) ||
      (u.email && u.email.toLowerCase().startsWith(searchLower));

    // Role filter by role name
    const matchesRole =
      !roleFilter ||
      (u.role &&
        u.role.name &&
        u.role.name.toLowerCase() === roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });
  // --- Toggle Status ---
  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/toggle-active`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = await res.json();
      setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
      setMessage("Status updated successfully");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };
  // --- Reset Password ---
  const resetPassword = async (u) => {
    if (!window.confirm(`Reset password for ${u.name}?`)) return;
    try {
      const response = await fetch(
        `${API_URL}/api/users/${u.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ email: u.email }), // 👈 send the email here
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(`Password reset link sent to ${u.email}`);
      } else {
        alert(data.message || "Failed to send reset link");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // --- Add User ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      setUsers([...users, data]);
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        role_id: "",
        team_id: "",
        password: "",
      });
      setMessage("User added successfully");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };
  // --- Edit User ---
  const handleEditClick = (u) => {
    setEditUser({
      name: u.name,
      email: u.email,
      role_id: u.role_id,
      team_id: u.team_id,
    });
    setSelectedUser(u);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
      });
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === selectedUser.id ? updated : u)));
      setShowEditModal(false);
      setSelectedUser(null);
      setMessage("User updated successfully");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };
  // --- Delete User ---
  const handleDeleteClick = (u) => {
    setSelectedUser(u);
    setShowDeleteModal(true);
  };
  const getUserAvatar = (u) => {
    if (u.profile_photo) {
      // Use uploaded profile photo
      return u.profile_photo.startsWith("http")
        ? u.profile_photo
        : `${API_URL}/storage/${u.profile_photo}?t=${new Date().getTime()}`;
    }
    // No photo, return null to render initials instead
    return null;
  };

  const getUserInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setMessage("User deleted successfully");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }
  return (
    <div className="px-6 overflow-y-hidden">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold"></h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-500 flex items-center 
        gap-2 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 cursor-pointer"
        >
          <FiUserPlus /> Add User
        </button>
      </div>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 w-1/3"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            // Use role name as value so the filter works
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Name & Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const roleName = u.role?.name || "—";
              const teamName = u.team?.name || "—";
              return (
                <tr
                  key={u.id}
                  className={`border-t transition ${
                    !u.status ? "opacity-50" : ""
                  }`}
                >
                  {/* Avatar */}
                  <td className="px-4 py-3">
                    {getUserAvatar(u) ? (
                      <img
                        src={getUserAvatar(u)}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#75C77C] flex items-center justify-center text-white font-bold text-xl">
                        {getUserInitials(u.name)}
                      </div>
                    )}
                  </td>
                  {/* Name & Email */}
                  <td className="px-4 py-3">
                    <div className="font-medium capitalize">{u.name}</div>
                    <div className="text-gray-500 text-sm">{u.email}</div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">{roleName}</td>

                  {/* Team */}
                  <td className="px-4 py-3">{teamName}</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={u.status}
                        onChange={() => toggleStatus(u.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-5 flex items-center rounded-full p-1 ${
                          u.status ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                            u.status ? "translate-x-5" : ""
                          }`}
                        ></div>
                      </div>
                    </label>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 flex space-x-2 relative">
                    {/* Edit */}
                    {u.id !== user?.id && (
                      <div className="relative group">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer"
                        >
                          <FiEdit />
                        </button>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Edit
                        </span>
                      </div>
                    )}

                    {/* Delete */}
                    {u.id !== user?.id && (
                      <div className="relative group">
                        <button
                          onClick={() => handleDeleteClick(u)}
                          className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
                        >
                          <FiTrash2 />
                        </button>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Delete
                        </span>
                      </div>
                    )}

                    {/* Reset Password */}
                    <div className="relative group">
                      <button
                        onClick={() => resetPassword(u)}
                        className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
                      >
                        <FiRefreshCcw />
                      </button>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Reset Password
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              />
              <select
                value={newUser.role_id}
                onChange={(e) =>
                  setNewUser({ ...newUser, role_id: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select
                value={newUser.team_id || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, team_id: e.target.value || null })
                }
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Select Team (Optional)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              />
              <select
                value={editUser.role_id}
                onChange={(e) =>
                  setEditUser({ ...editUser, role_id: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              >
                <option value={editUser.name}>Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select
                value={editUser.team_id}
                onChange={(e) =>
                  setEditUser({ ...editUser, team_id: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              >
                <option value="">Select Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80 text-center">
            <p className="mb-4 text-lg font-medium">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser?.name}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
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
