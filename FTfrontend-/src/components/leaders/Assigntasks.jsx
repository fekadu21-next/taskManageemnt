import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiX,
  FiUserPlus,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = "http://127.0.0.1:8000/api";
const STATUSES = ["To Do", "In Progress", "Under Review", "Completed"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function Tasks() {
  const { user } = useAuth();
  const { user: loggedInUser } = useAuth();
  const token = localStorage.getItem("access_token");

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState({
    project: "All",
    status: "All",
    priority: "All",
    assigneeId: "All",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  // --- Fetch tasks in leader's team only ---
  //   const fetchTasks = async () => {
  //     try {
  //       const query = new URLSearchParams();
  //       if (search) query.append("search", search);
  //       if (filter.project !== "All") query.append("project", filter.project);
  //       if (filter.status !== "All") query.append("status", filter.status);
  //       if (filter.priority !== "All") query.append("priority", filter.priority);
  //       if (filter.assigneeId !== "All") query.append("assignee_id", filter.assigneeId);

  //       // Filter by team for leader
  //       if (user.role_id === 2) query.append("team_id", user.team_id);

  //       const res = await fetch(`${API_URL}/tasks?${query.toString()}`, { headers: authHeaders });
  //       const data = await res.json();
  //       setTasks(data.tasks || []);
  //     } catch (err) {
  //       console.error("Fetch tasks error:", err);
  //       setTasks([]);
  //     }
  //   };
  const fetchTasks = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (filter.project !== "All") query.append("project", filter.project);
      if (filter.status !== "All") query.append("status", filter.status);
      if (filter.priority !== "All") query.append("priority", filter.priority);
      if (filter.assigneeId !== "All")
        query.append("assignee_id", filter.assigneeId);

      // ✅ No need to manually append team_id anymore
      // because backend controller already restricts tasks
      // based on leader's team_id

      const res = await fetch(`${API_URL}/taskks?${query.toString()}`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        console.error("Fetch failed with status:", res.status);
        throw new Error("Failed to fetch tasks");
      }

      const data = await res.json();
      console.log("✅ Tasks fetched:", data); // <-- log fetched data

      setTasks(data.tasks || []);
    } catch (err) {
      console.error("❌ Fetch tasks error:", err); // <-- log error
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch projects in leader's team ---
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projectts`, { headers: authHeaders });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setProjects([]);
    }
  };
  // --- Fetch team users only ---
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/team-members`, {
        headers: authHeaders,
      });
      const data = await res.json();
      setUsers(data.members || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (token) fetchTasks();
  }, [search, filter]);

  const badgeClass = (kind, value) => {
    const base =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const colors = {
      status: {
        "To Do": "bg-slate-100 text-slate-700",
        "In Progress": "bg-blue-100 text-blue-700",
        "Under Review": "bg-amber-100 text-amber-700",
        Completed: "bg-emerald-100 text-emerald-700",
      },
      priority: {
        Low: "bg-slate-100 text-slate-700",
        Medium: "bg-indigo-100 text-indigo-700",
        High: "bg-pink-100 text-pink-700",
        Critical: "bg-red-100 text-red-700",
      },
    };
    return `${base} ${colors[kind][value] || "bg-gray-100 text-gray-700"}`;
  };

  const AssigneesCell = ({ assignee }) =>
    assignee ? (
      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
        {assignee.name}
      </span>
    ) : (
      <span className="text-gray-400">Unassigned</span>
    );

  const CreatorsCell = ({ creator }) =>
    creator ? (
      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
        {creator.name}
      </span>
    ) : (
      <span className="text-gray-400">Unassigned</span>
    );

  const AssignersCell = ({ assigner }) =>
    assigner ? (
      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
        {assigner.name}
      </span>
    ) : (
      <span className="text-gray-400">Unassigned</span>
    );
  const getProjectName = (id) =>
    projects.find((p) => p.id === id)?.name || "N/A";

  // --- Actions ---
  const openCreate = () => {
    setEditTask(null);
    setSuccessMessage("");
    setModalOpen(true);
  };
  const openEdit = (task) => {
    setEditTask(task);
    setSuccessMessage("");
    setModalOpen(true);
  };
  const openAssign = () => {
    setSuccessMessage("");
    setAssignModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (editTask) {
        const res = await fetch(`${API_URL}/tasks/${editTask.id}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok) {
          setSuccessMessage("Task updated successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        } else console.error("Update error:", result);
      } else {
        const res = await fetch(`${API_URL}/tasks`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            ...data,
            created_by: user.id,
            team_id: user.team_id,
          }),
        });
        const result = await res.json();
        if (res.ok) {
          setSuccessMessage("Task created successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        } else console.error("Create error:", result);
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error("Save task error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const result = await res.json();
      if (res.ok) {
        setSuccessMessage("Task deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else console.error("Delete error:", result);
      setConfirmOpen(false);
      fetchTasks();
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const AssignerCell = ({ assigner, loggedInUser, onEdit, onDelete }) => {
    return (
      <div className="flex items-center justify-between gap-2">
        {/* Assigner name removed */}
        <div>{/* Do not display anything */}</div>
        {/* Actions */}
        <div className="flex gap-2">
          {/* Edit is always visible */}
          <div className="relative group">
            <button
              onClick={onEdit}
              className="p-1 rounded hover:bg-gray-100 text-blue-500"
            >
              <FiEdit />
            </button>
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              Update
            </span>
          </div>
          {/* Delete only if loggedInUser is the assigner */}
          {assigner && loggedInUser && assigner.id === loggedInUser.id && (
            <div className="relative group">
              <button
                onClick={onDelete}
                className="p-1 rounded hover:bg-gray-100 text-red-500"
              >
                <FiTrash2 />
              </button>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                Delete
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };
  const handleAssign = async ({ task_id, user_id }) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${task_id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ assigned_to: user_id }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccessMessage("Task assigned successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setAssignModalOpen(false);
        fetchTasks();
      } else console.error("Assign error:", result);
    } catch (err) {
      console.error("Assign task error:", err);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading task data...</p>
      </div>
    );
  }
  return (
    <div className="p-5">
      {successMessage && (
        <div className="mb-4 p-3 rounded  text-green-500">{successMessage}</div>
      )}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="flex gap-2 ">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="px-3 py-1 rounded-lg border flex items-center gap-1 cursor-pointer"
          >
            <FiFilter /> Filters
            {filtersOpen ? <FiChevronDown /> : <FiChevronUp />}
          </button>
          <button
            onClick={openCreate}
            className="px-3 py-1 rounded-lg bg-teal-600 text-white flex items-center gap-1 hover:bg-teal-700 cursor-pointer"
          >
            <FiPlus /> Add Task
          </button>
          <button
            onClick={openAssign}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white flex items-center gap-1 hover:bg-indigo-800 cursor-pointer"
          >
            <FiUserPlus /> Assign Task
          </button>
        </div>
      </div>
      {filtersOpen && (
        <div className="mb-4 grid sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select
            value={filter.project}
            onChange={(e) =>
              setFilter((p) => ({ ...p, project: e.target.value }))
            }
            className="border rounded px-3 py-2"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter((p) => ({ ...p, status: e.target.value }))
            }
            className="border rounded px-3 py-2"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filter.priority}
            onChange={(e) =>
              setFilter((p) => ({ ...p, priority: e.target.value }))
            }
            className="border rounded px-3 py-2"
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg shadow -mx-6">
        <table className="w-full  ">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3">Title</th>
              <th className="px-2 py-3">Project</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Created by</th>
              <th className="px-2 py-3">Assigned by</th>
              <th className="px-2 py-3">Assigned at</th>
              <th className="px-2 py-3">Priority</th>
              <th className="px-2 py-3">Assignee to</th>
              <th className="px-2 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-2 py-3 ">{t.title}</td>
                <td className="px-2 py-3">{getProjectName(t.project_id)}</td>
                <td className="px-2 py-3">
                  <span className={badgeClass("status", t.status)}>
                    {t.status}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <CreatorsCell creator={t.creator} />
                </td>
                <td className="px-2 py-3">
                  <AssignersCell assigner={t.assigner} />
                </td>
                <td className="px-2 py-3">{t.assigned_at}</td>
                <td className="px-2 py-3">
                  <span className={badgeClass("priority", t.priority)}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <AssigneesCell assignee={t.assignee} />
                </td>
                <td className="px-2 py-3 ">
                  <AssignerCell
                    assigner={t.assigner}
                    loggedInUser={loggedInUser}
                    onEdit={() => openEdit(t)}
                    onDelete={() => {
                      setDeletingId(t.id);
                      setConfirmOpen(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modals */}
      {modalOpen && (
        <TaskFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSave}
          initial={editTask}
          users={users}
          projects={projects}
        />
      )}
      {assignModalOpen && (
        <AssignTaskModal
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          tasks={tasks}
          users={users}
          onAssign={handleAssign}
        />
      )}
      {confirmOpen && (
        <ConfirmModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => handleDelete(deletingId)}
        />
      )}
    </div>
  );
}
// --- Task Form Modal ---
function TaskFormModal({ open, onClose, onSubmit, initial, users, projects }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    project_id: "",
    due_date: "",
    assigned_to: "",
  });
  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        description: initial.description || "",
        status: initial.status || "To Do",
        priority: initial.priority || "Medium",
        project_id: initial.project_id || "",
        due_date: initial.due_date || "",
        assigned_to: initial.assignee ? String(initial.assignee.id) : "",
      });
    }
  }, [initial]);

  const update = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-124 max-w-xl bg-white mt-2 mb-8 ">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-lg font-semibold">
            {initial ? "Edit Task" : "Add Task"}
          </h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <FiX />
          </button>
        </div>
        <form onSubmit={submit} className="px-4 py-2 space-y-2">
          <div>
            <label className="block text-sm font-medium ">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={update}
              className="w-full border rounded px-3 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium ">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium ">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={update}
                className="w-full border rounded px-3 py-2"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium ">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={update}
                className="w-full border rounded px-3 py-2"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="">
              <label className="block text-sm font-medium ">Project</label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={update}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Project </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {/* ✅ Show "Assign To" only when adding new task */}
            {/* {!initial && ( */}
            <div>
              <label className="block text-sm font-medium mb-0.5">
                Assign To
              </label>
              <select
                name="assigned_to"
                value={form.assigned_to}
                onChange={update}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">un assigned </option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            {/* )} */}
          </div>
          <div>
            <label className="block text-sm font-medium mt-4">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={update}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-300 bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-500 hover:bg-gray-700 text-white cursor-pointer"
            >
              {initial ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Assign Task Modal ---
function AssignTaskModal({ open, onClose, tasks, users, onAssign }) {
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const unassignedTasks = tasks.filter((t) => !t.assignee);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTask || !selectedUser) return;
    onAssign({ task_id: selectedTask, user_id: selectedUser });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-5">
        <h3 className="text-lg font-semibold mb-3">Assign Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Task
            </label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value=""> Select Task </option>
              {unassignedTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select User </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white cursor-pointer"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// --- Confirm Modal ---
function ConfirmModal({ open, onCancel, onConfirm, assigner }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg">
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-2">Delete Task</h3>
          <p className="text-gray-600">
            Are you sure you want to delete this task
            {assigner?.name && (
              <>
                {" "}
                assigned by <span className="font-medium">{assigner.name}</span>
                ?
              </>
            )}
          </p>
        </div>
        <div className="p-5 flex justify-end gap-2 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
