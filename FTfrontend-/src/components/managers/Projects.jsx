import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus, FiLayout, FiTable } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
const API_URL = "http://127.0.0.1:8000/api";
export default function Projects() {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    team_id: "",
    start_date: "",
    end_date: "",
    status: "Pending",
  });
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  useEffect(() => {
    fetchTeams();
    fetchProjectsProgress(); // ✅ Fetch progress dynamically
  }, []);
  // ✅ Fetch Teams
  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/teams`, { headers });
      if (!res.ok) throw new Error(`Teams API error ${res.status}`);
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const validateDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);

    if (startDate >= endDate) {
      showAlert("End date must be after start date", "error");
      return false;
    }

    if (endDate < today) {
      showAlert("End date must be today or in the future", "error");
      return false;
    }
    return true;
  };

  // ✅ Fetch Projects with Dynamic Progress
  const fetchProjectsProgress = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks/projectProgress`, { headers });
      if (!res.ok) throw new Error(`Projects API error ${res.status}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };
  // Inside handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDates()) {
      return;
    }
    const method = editProject ? "PUT" : "POST";
    const url = editProject
      ? `${API_URL}/projects/${editProject.id}`
      : `${API_URL}/projects`;
    try {
      // ✅ Make sure token exists
      if (!token) {
        showAlert("You must be logged in to perform this action", "error");
        return;
      }
      const payload = {
        name: form.name,
        description: form.description || null, // ✅ Send null instead of empty string
        team_id: form.team_id ? parseInt(form.team_id) : null,
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
      };
      console.log("📤 Sending payload:", payload); // ✅ Debug log
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Ensure token is sent
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error response:", data);
        // ✅ Show specific error message from backend
        const errorMsg = data.message || data.error || "Failed to save project";
        showAlert(errorMsg, "error");
        return;
      }
      console.log("✅ Success response:", data); // ✅ Debug log
      await fetchProjectsProgress();
      setShowAddModal(false);
      setEditProject(null);
      showAlert(
        editProject
          ? "Project updated successfully!"
          : "Project added successfully!"
      );
      setForm({
        name: "",
        description: "",
        team_id: "",
        start_date: "",
        end_date: "",
        status: "Pending",
      });
    } catch (error) {
      console.error("💥 Save error:", error);
      showAlert("Network error: Failed to save project", "error");
    }
  };
  // ✅ Edit Handler
  const handleEditClick = (proj) => {
    setForm({
      name: proj.name,
      description: proj.description || "",
      team_id: proj.team_id || "", // ✅ This already sets the team_id
      start_date: proj.start_date,
      end_date: proj.end_date,
      status: proj.status,
    });
    setEditProject(proj);
    setShowAddModal(true);
  };
  // ✅ Delete Handler
  const handleDelete = (proj) => setShowDeleteModal(proj);
  const confirmDelete = async () => {
    try {
      await fetch(`${API_URL}/projects/${showDeleteModal.id}`, {
        method: "DELETE",
        headers,
      });
      await fetchProjectsProgress();
      setShowDeleteModal(null);
      showAlert("Project deleted successfully!");
    } catch (err) {
      console.error("Error deleting project:", err);
      showAlert("Failed to delete project", "error");
    }
  };
  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const filteredProjects = projects.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.team && p.team.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* ✅ Alert Message */}
      {alert && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg shadow ${
            alert.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setViewMode(viewMode === "table" ? "canvas" : "table")
            }
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600"
          >
            {viewMode === "table" ? <FiLayout /> : <FiTable />}
            {viewMode === "table" ? "Canvas View" : "Table View"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-500 flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700"
          >
            <FiPlus /> Add Project
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search project or team..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded-xl mb-4 w-1/3"
      />

      {/* Table View */}
      {viewMode === "table" && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No matching projects
                  </td>
                </tr>
              )}
              {filteredProjects.map((proj) => (
                <tr
                  key={proj.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{proj.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {proj.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {proj.team ? proj.team.name : "Not Assigned"}
                  </td>
                  <td className="px-4 py-3">{proj.start_date}</td>
                  <td className="px-4 py-3">{proj.end_date}</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className={`h-4 rounded ${
                          proj.progress < 50
                            ? "bg-orange-500"
                            : proj.progress === 100
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                    <span className="text-sm">{proj.progress}%</span>
                  </td>
                  <td className="px-4 py-3">{proj.status}</td>
                  <td className="px-4 py-3 flex space-x-2">
                    <button
                      onClick={() => handleEditClick(proj)}
                      className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(proj)}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Canvas View */}
      {viewMode === "canvas" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">{proj.name}</h3>
              <p className="text-gray-600 mb-2">{proj.description || "-"}</p>
              <div className="text-sm text-gray-500 mb-3">
                <p>
                  <strong>Team:</strong> {proj.team?.name || "Not Assigned"}
                </p>
                <p>
                  <strong>Status:</strong> {proj.status}
                </p>
                <p>
                  <strong>Start:</strong> {proj.start_date}
                </p>
                <p>
                  <strong>End:</strong> {proj.end_date}
                </p>
              </div>
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded h-4">
                  <div
                    className={`h-4 rounded ${
                      proj.progress < 50
                        ? "bg-orange-500"
                        : proj.progress === 100
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
                <span className="text-sm">{proj.progress}%</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEditClick(proj)}
                  className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(proj)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Add/Edit Modal (without progress field) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editProject ? "Edit Project" : "Add Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Project Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex gap-4">
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  required
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <select
                name="team_id"
                value={form.team_id} // ✅ This binds to the team_id from form state
                onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Not Assigned</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <select
                name="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditProject(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editProject ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to delete{" "}
              <span className="text-red-600">{showDeleteModal.name}</span>?
            </h2>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
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
