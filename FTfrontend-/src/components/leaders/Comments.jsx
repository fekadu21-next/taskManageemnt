import React, { useEffect, useMemo, useState } from "react";
import {
  FiPaperclip,
  FiSend,
  FiX,
  FiFileText,
  FiFile,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiGrid,
  FiList,
  FiTrash2,
} from "react-icons/fi";
import { formatDistanceToNowStrict } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
const API_URL = "http://localhost:8000/api";

function timeAgo(date) {
  if (!date) return "";
  const secondsAgo = Math.floor((new Date() - new Date(date)) / 1000);
  if (secondsAgo < 5) return "just now";
  if (secondsAgo < 60)
    return `${secondsAgo} second${secondsAgo > 1 ? "s" : ""} ago`;
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export default function Comments({ recentCount = 3 }) {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);

  const [showAll, setShowAll] = useState(false);
  const [layout, setLayout] = useState("list");
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Timer for refresh
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTimer((t) => t + 1), 10000);
    return () => clearInterval(i);
  }, []);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [formTaskId, setFormTaskId] = useState("");
  const [formRecipientId, setFormRecipientId] = useState("");
  const [formText, setFormText] = useState("");
  const [formFiles, setFormFiles] = useState([]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Fetch users, tasks, comments
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`, { headers: authHeaders });
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : data.data || [];
        setUsers(safeData);
        console.log("feched users:", safeData);
        if (safeData.length && !formRecipientId)
          setFormRecipientId(safeData[0].id);
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/taskks`, { headers: authHeaders });
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : data.tasks || [];
        setTasks(safeData);
        console.log("feched tasks:", safeData);
        if (safeData.length && !formTaskId) setFormTaskId(safeData[0].id);
      } catch (err) {
        console.error("Fetch tasks error:", err);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/comments/all`, {
          headers: authHeaders,
        });
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : data.data || [];
        setComments(safeData);
        console.log("feched comments:", safeData);
      } catch (err) {
        console.error("Fetch comments error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchTasks();
    fetchComments();
  }, [token]);

  // File handling
  const handleFileAdd = (e) => {
    const list = Array.from(e.target.files || []);
    setFormFiles((prev) => [...prev, ...list]);
    e.target.value = null;
  };
  const handleFileRemove = (idx) =>
    setFormFiles((prev) => prev.filter((_, i) => i !== idx));

  // Create comment
  const handleCreateComment = async () => {
    if (!formText.trim() && formFiles.length === 0) return;

    const formData = new FormData();
    formData.append("comment_text", formText.trim());
    formData.append("recipient_id", formRecipientId); // NEW: recipient
    formFiles.forEach((file) => formData.append("attachments[]", file));

    try {
      const res = await fetch(`${API_URL}/tasks/${formTaskId}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        console.error("Create comment error:", errData);
        return;
      }
      const newComment = await res.json();
      // setComments((prev) => [newComment, ...prev]);
      setFormText("");
      setFormFiles([]);
      setOpenModal(false);
      setSuccessMessage("Comment sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };
  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        console.error("Delete comment error");
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setSuccessMessage("Comment sent successfully!");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Download attachment
  const downloadFile = async (file) => {
    try {
      const res = await fetch(`${API_URL}/attachments/${file.id}/download`, {
        headers: authHeaders,
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };
  // Enrich comments with sender, recipient, task, files
  const enriched = useMemo(() => {
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));
    const tasksById = Object.fromEntries(tasks.map((t) => [t.id, t]));
    return (
      comments
        .map((c) => ({
          ...c,
          user: usersById[c.user_id] || { name: "Unknown" }, // sender
          recipient: usersById[c.recipient_id] || { name: "Unknown" }, // recipient
          task: tasksById[c.task_id] || { title: "Unknown" },
          files: c.attachments || [],
        }))
        // FILTER: only show comments for logged-in user as sender or recipient
        .filter((c) => c.user_id === user?.id || c.recipient_id === user?.id)
        .filter((c) =>
          search.trim()
            ? c.comment_text.toLowerCase().includes(search.toLowerCase()) ||
              c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
              c.recipient?.name?.toLowerCase().includes(search.toLowerCase()) ||
              c.task?.title?.toLowerCase().includes(search.toLowerCase())
            : true
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    );
  }, [comments, users, tasks, search, user]);

  const displayed = showAll ? enriched : enriched.slice(0, recentCount);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading comments...</p>
      </div>
    );
  }
  return (
    <div className="p-6 -mt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <input
            className="px-3 py-2 bg-white rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
            placeholder="Search comment, user, task…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setLayout((l) => (l === "grid" ? "list" : "grid"))}
            className="p-2 rounded-xl bg-white border hover:bg-gray-50"
          >
            {layout === "grid" ? <FiList /> : <FiGrid />}
          </button>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-slate-400 text-white px-4 py-2 rounded-xl hover:bg-slate-500"
          >
            <FiPlus /> Add
          </button>
        </div>
      </div>

      {/* Comments Display */}
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4"
            : "space-y-4"
        }
      >
        {displayed.map((c) => (
          <div
            key={c.id}
            className={`bg-white p-4 rounded-2xl shadow-lg flex flex-col gap-3 border border-transparent hover:border-gray-200`}
          >
            <div className="flex items-start gap-3">
              <img
                src={c.user?.profile_photo || "https://i.pravatar.cc/48"}
                alt={user?.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {" "}
                        <span className="text-xs">from </span>
                        {c.user?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        → {c.recipient?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                        Task: {c.task?.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {timeAgo(c.created_at)}
                    </span>
                    {(c.recipient_id === c.recipient?.id ||
                      user?.role === "admin") && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this comment?"
                            )
                          ) {
                            handleDeleteComment(c.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{c.comment_text}</p>
                {c.files?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.files.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => downloadFile(f)}
                        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm hover:bg-gray-200"
                      >
                        <FiFileText /> {f.file_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {enriched.length > recentCount && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="relative flex items-center gap-2 text-blue-600 hover:text-green-500 mt-5 mx-auto group"
        >
          {showAll ? <FiChevronUp /> : <FiChevronDown />}
          {showAll ? "" : `(${enriched.length})`}

          {/* Hover text */}
          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {showAll ? "Collapse Comments" : "View All Comments"}
          </span>
        </button>
      )}

      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 text-green-500  px-4 py-2 rounded  z-50">
          {successMessage}
        </div>
      )}
      {/* Add Comment Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenModal(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FiFileText /> Add Comment
                </h3>
                <button
                  onClick={() => setOpenModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <FiX />
                </button>
              </div>

              <div className="mb-3">
                <label className="text-sm text-gray-600">
                  Select Recipient
                </label>
                <select
                  className="w-full mt-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formRecipientId}
                  onChange={(e) => setFormRecipientId(Number(e.target.value))}
                >
                  {users
                    .filter((u) => u.id !== user?.id) // Exclude self
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="text-sm text-gray-600">Select Task</label>
                <select
                  className="w-full mt-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formTaskId}
                  onChange={(e) => setFormTaskId(Number(e.target.value))}
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="text-sm text-gray-600">Comment</label>
                <textarea
                  rows={4}
                  className="w-full mt-1 border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Write your comment…"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                />
              </div>
              {formFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm"
                    >
                      <FiFile /> {f.name}
                      <button
                        onClick={() => handleFileRemove(i)}
                        className="text-red-500"
                        title="Remove"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-800">
                  <FiPaperclip /> Attach Files
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileAdd}
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormText("");
                      setFormFiles([]);
                      setOpenModal(false);
                    }}
                    className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateComment}
                    className="bg-slate-400 text-white px-4 py-2 rounded-xl hover:bg-slate-500 flex items-center gap-2"
                  >
                    <FiSend /> Sent Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
