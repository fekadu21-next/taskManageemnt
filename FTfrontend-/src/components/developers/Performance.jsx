import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FaTasks,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
const API_URL = "http://localhost:8000";
const Performances = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    onTimeTasks: 0,
    // avgCompletionTime: 0,
    trend: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/performance`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 401) {
          setError("Session expired. Please login again.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load performance data");
        }

        const data = await res.json();

        // Use updated_at as completed_at for display
        const tasksWithCompleted = (data.tasks || []).map((t) => ({
          ...t,
          completed_at: t.status === "Completed" ? t.updated_at : null,
        }));
        setTasks(tasksWithCompleted);
        setStats({
          totalTasks: data.totalTasks,
          completedTasks: data.completedTasks,
          overdueTasks: data.overdueTasks,
          onTimeTasks: data.onTimeTasks,
          // avgCompletionTime: data.avgCompletionTime,
          trend: data.trend || [],
        });
        console.log("feched data:", data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status.toLowerCase() === filter;
  });
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800"></h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 -mt-12 mr-12"
        >
          <option value="all">All Tasks</option>
          <option value="completed">Completed</option>
          <option value="in progress">In Progress</option>
          <option value="to do">To Do</option>
        </select>
      </div>

      {error && (
        <div className="text-red-600 font-medium bg-red-50 border border-red-200 p-3 rounded-lg">
          {error}
        </div>
      )}
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-4">
        <KpiCard
          icon={<FaTasks className="text-indigo-500 text-3xl" />}
          title="Total Tasks"
          value={stats.totalTasks}
        />
        <KpiCard
          icon={<FaCheckCircle className="text-green-500 text-3xl" />}
          title="Completed"
          value={stats.completedTasks}
        />
        <KpiCard
          icon={<FaExclamationCircle className="text-red-500 text-3xl" />}
          title="Overdue"
          value={stats.overdueTasks}
        />
        <KpiCard
          icon={<FaClock className="text-yellow-500 text-3xl" />}
          title=" On Time"
          value={stats.onTimeTasks}
        />
      </div>
      {/* Trend Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Weekly Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="overdue"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Recent Tasks Table */}
      <div className="bg-[#F3F4F6]  rounded-xl p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Tasks
        </h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-600">
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Completed At</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  No tasks found.
                </td>
              </tr>
            )}
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">
                  {" "}
                  <td className="px-2 py-3 font-base break-words">
                    {task.title.split(" ").map((word, index) =>
                      index % 3 === 0 && index !== 0 ? (
                        <React.Fragment key={index}>
                          <br />
                          {word + " "}
                        </React.Fragment>
                      ) : (
                        <span key={index}>{word + " "}</span>
                      )
                    )}
                  </td>
                </td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    task.status === "Completed"
                      ? "text-green-600"
                      : task.status === "In Progress"
                      ? "text-yellow-600"
                      : "text-gray-800"
                  }`}
                >
                  {task.status}
                </td>
                <td className="px-4 py-3">{task.due_date}</td>
                <td className="px-4 py-3">
                  {task.completed_at
                    ? new Date(task.completed_at).toLocaleString()
                    : "not completed"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// KPI Card Component
const KpiCard = ({ icon, title, value }) => (
  <div className="bg-white shadow rounded-xl p-5 flex items-center space-x-4">
    <div>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export default Performances;
