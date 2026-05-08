import React, { useMemo, useState, useEffect } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEdit2,
  FiFilter,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
const cls = (...s) => s.filter(Boolean).join(" ");
const STATUS = ["To Do", "In Progress", "Under Review", "Completed"];
const PRIORITY = ["Low", "Medium", "High", "Critical"];
const statusBadge = {
  "To Do": "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Under Review": "bg-orange-100 text-orange-700",
  Completed: "bg-green-100 text-green-700",
};
const priorityBadge = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-yellow-100 text-yellow-800",
  Critical: "bg-red-100 text-red-700",
};
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

/** ---- Modal Shell ---- */
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-800 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        aria-label="Close modal backdrop"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[460px] max-w-2xl rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
          {footer ? <div className="border-t px-5 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** ---- Update Status Modal ---- */
function UpdateStatusModal({ open, task, onClose, onSave }) {
  const [status, setStatus] = useState(task?.status ?? "To Do");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setNote("");
    }
  }, [task]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Update "${task?.title ?? ""}"`}
      footer={
        <div className="flex items-center ml-16 gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ status, note })}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            className="w-64 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
const ProjectCell = ({ project }) =>
  project ? (
    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
      {project.name}
    </span>
  ) : (
    <span className="text-gray-400">Unassigned</span>
  );
const CreatorCell = ({ creator }) =>
  creator ? (
    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
      {creator.name}
    </span>
  ) : (
    <span className="text-gray-400">Unassigned</span>
  );
const AssignerCell = ({ assigner }) =>
  assigner ? (
    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
      {assigner.name}
    </span>
  ) : (
    <span className="text-gray-400">Unassigned</span>
  );

/** ---- Task Details Modal ---- */
function TaskDetailsModal({ open, task, onClose }) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Task Details">
      {!task ? (
        <p className="text-gray-500">No task selected.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-semibold">
              {task.title || "Untitled Task"}
            </h4>
            <span
              className={cls(
                "rounded-full px-2.5 py-1 text-xs",
                statusBadge[task.status] ?? "bg-gray-100 text-gray-700"
              )}
            >
              {task.status || "To Do"}
            </span>
            <span
              className={cls(
                "rounded-full px-2.5 py-1 text-xs",
                priorityBadge[task.priority] ?? "bg-gray-100 text-gray-700"
              )}
            >
              {task.priority || "Medium"}
            </span>
          </div>

          <p className="text-sm text-gray-600">
            {task.description || "No description provided."}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Project</div>
              <div className="font-medium">
                {task?.project ? <ProjectCell project={task.project} /> : "N/A"}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Deadline</div>
              <div className="font-medium">{formatDate(task.due_date)}</div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 sm:col-span-2">
              <div className="text-xs text-gray-500">Assigned By</div>
              <div className="font-medium">
                {task?.creator ? (
                  <AssignerCell assigner={task.assigner} />
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** ---- Filter Tabs ---- */
function FilterTabs({ active, counts, onChange }) {
  const items = ["All", ...STATUS];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cls(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
            active === key
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {key}
          <span
            className={cls(
              "rounded-full px-2 py-0.5 text-xs",
              active === key
                ? "bg-white/20 text-white"
                : "bg-red-200 text-gray-700"
            )}
          >
            {counts[key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

/** ---- Main Page ---- */
export default function Tasks() {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [prio, setPrio] = useState("All");
  const [sortAsc, setSortAsc] = useState(null);

  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /** ---- Fetch tasks ---- */
  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/Devtasks", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        console.log("Fetched tasks data:", data);
        setTasks(data.tasks || []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [token]);

  /** ---- Update Task Status ---- */
  const saveUpdate = async ({ status, note }) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/tasks/${selected.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, note }),
        }
      );
      const updatedTask = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      setShowUpdate(false);
      setSuccessMessage(`Task status updated successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const counts = useMemo(() => {
    const base = { All: tasks.length };
    STATUS.forEach(
      (s) => (base[s] = tasks.filter((t) => t.status === s).length)
    );
    return base;
  }, [tasks]);

  const filtered = useMemo(() => {
    let rows = [...tasks];

    // Apply filters
    if (tab !== "All") rows = rows.filter((t) => t.status === tab);
    if (prio !== "All") rows = rows.filter((t) => t.priority === prio);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.project?.name?.toLowerCase().includes(q) ||
          t.creator?.name?.toLowerCase().includes(q)
      );
    }

    // Apply sorting
    if (sortAsc !== null) {
      // user clicked sort → sort by due_date
      rows.sort((a, b) => {
        const A = new Date(a.due_date).getTime();
        const B = new Date(b.due_date).getTime();
        return sortAsc ? A - B : B - A;
      });
    } else {
      // default sorting → assigned_at descending
      rows.sort(
        (a, b) =>
          new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
      );
    }

    return rows;
  }, [tasks, tab, prio, query, sortAsc]);

  const openDetails = (task) => {
    setSelected(task);
    setShowDetails(true);
  };

  const openUpdate = (task) => {
    setSelected(task);
    setShowUpdate(true);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading task data...</p>
      </div>
    );
  }
  return (
    <div className="p-6">
      {successMessage && (
        <div className="mb-4 rounded-xl bg-green-100 px-4 py-2 text-green-800">
          {successMessage}
        </div>
      )}
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold"></h1>
          <p className="text-sm text-gray-500"></p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-64 rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search title, project, assignee…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={prio}
              onChange={(e) => setPrio(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["All", ...PRIORITY].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setSortAsc((s) => (s === true ? false : true))}
            className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            title="Sort by deadline"
          >
            Deadline {sortAsc === true ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-6">
        <FilterTabs active={tab} counts={counts} onChange={setTab} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow">
        <table className="min-w-[900px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <th className="sticky left-0 z-10 bg-gray-50 px-5 py-3">Title</th>
              <th className="px-3 py-3">Project</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Deadline</th>
              <th className="px-3 py-3">Created By</th>
              <th className="px-3 py-3">Assigned By</th>
              <th className="px-3 py-3">Assigned at</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, idx) => (
              <tr
                key={t.id}
                className={cls(
                  "text-sm text-gray-800",
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                  "hover:bg-blue-50/40"
                )}
              >
                <td className="sticky left-0 z-10 bg-inherit px-5 py-4 font-medium">
                  {t.title}
                </td>
                <td className="px-3 py-4">
                  <ProjectCell project={t.project} />
                </td>
                <td className="px-3 py-4">
                  <span
                    className={cls(
                      "rounded-full px-2.5 py-1 text-xs",
                      priorityBadge[t.priority]
                    )}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="px-3 py-4">{formatDate(t.due_date)}</td>
                <td className="px-3 py-4">
                  <CreatorCell creator={t.creator} />
                </td>
                <td className="px-3 py-4">
                  <AssignerCell assigner={t.assigner} />
                </td>
                <td className="sticky left-0 z-10 bg-inherit px-5 py-4 font-medium">
                  {t.assigned_at}
                </td>
                <td className="px-3 py-4">
                  <span
                    className={cls(
                      "rounded-full px-2.5 py-1 text-xs",
                      statusBadge[t.status]
                    )}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openDetails(t)}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      title="View details"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => openUpdate(t)}
                      className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                      title="Update status"
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-gray-500"
                >
                  No tasks match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <TaskDetailsModal
        open={showDetails}
        task={selected}
        onClose={() => setShowDetails(false)}
      />
      <UpdateStatusModal
        open={showUpdate}
        task={selected}
        onClose={() => setShowUpdate(false)}
        onSave={saveUpdate}
      />
    </div>
  );
}
