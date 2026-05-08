import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiUsers,
  FiList,
  FiColumns,
  FiEdit,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = "http://localhost:8000";

// Status colors
const statusColors = {
  Pending: "bg-gray-200 text-gray-700",
  "In Progress": "bg-purple-200 text-purple-700",
  Completed: "bg-green-200 text-green-700",
};
export default function Projects() {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("kanban");
  const [editProject, setEditProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- FETCH PROJECT PROGRESS ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }
        // ✅ Fetch project progress dynamically
        const res = await fetch(`${API_URL}/api/tasks/projectProgress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  // --- FILTER ---
  const filteredProjects = projects.filter(
    (p) =>
      (filter === "All" || p.status === filter) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- UPDATE STATUS ---
  const handleSave = async () => {
    if (!editProject) return;

    try {
      const res = await fetch(`${API_URL}/api/projectts/${editProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editProject.status,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Failed with status ${res.status}`);
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === data.project.id ? data.project : p))
      );

      setEditProject(null);

      setSuccessMessage("Project status successfully updated!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating project:", err);
      alert(`Failed to update project: ${err.message}`);
    }
  };

  if (!user) return <div className="p-6">Loading user...</div>;
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      {/* ✅ Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none w-40 md:w-60"
            />
          </div>
          {/* Filter */}
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
            <FiFilter className="text-gray-500 mr-2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="outline-none bg-transparent"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          {/* View Switch */}
          <div className="flex border rounded-lg bg-white shadow-sm">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-2 flex items-center gap-1 transition ${
                view === "kanban"
                  ? "bg-blue-500 text-white rounded-l-lg"
                  : "text-gray-500"
              }`}
            >
              <FiColumns /> Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-2 flex items-center gap-1 transition ${
                view === "table"
                  ? "bg-blue-500 text-white rounded-r-lg"
                  : "text-gray-500"
              }`}
            >
              <FiList /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Projects */}
      {filteredProjects.length > 0 ? (
        view === "kanban" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      statusColors[project.status]
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {project.description}
                </p>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <FiUsers className="mr-2" /> {project.team?.name || "No Team"}
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>📅 {project.start_date}</span>
                  <span>⏳ {project.end_date}</span>
                </div>
                <button
                  onClick={() => setEditProject(project)}
                  className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Edit Project
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <table className="min-w-full rounded-2xl">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Progress</th>
                <th className="px-4 py-3 text-left">Start</th>
                <th className="px-4 py-3 text-left">End</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-4">{project.name}</td>
                  <td className="px-4 py-4">{project.description}</td>
                  <td className="px-4 py-4">
                    {project.team?.name || "No Team"}
                  </td>
                  <td className="px-4 py-4">{project.status}</td>
                  <td className="px-4 py-4">{project.progress}%</td>
                  <td className="px-4 py-4">{project.start_date}</td>
                  <td className="px-4 py-4">{project.end_date}</td>
                  <td className="px-4 py-4">
                    <div className="relative group inline-block">
                      <button onClick={() => setEditProject(project)}>
                        <FiEdit className="ml-6" />
                      </button>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                        Update
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : (
        <p className="text-gray-500">No projects found.</p>
      )}

      {/* Edit Modal */}
      {editProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 relative">
            <button
              onClick={() => setEditProject(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FiX size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Project</h3>

            <label className="block mb-2 text-sm font-medium">Status</label>
            <select
              value={editProject.status}
              onChange={(e) =>
                setEditProject({ ...editProject, status: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 mb-4"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <button
              onClick={handleSave}
              className="w-32 bg-teal-500 ml-32 text-white py-2 rounded-lg hover:bg-teal-600 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
