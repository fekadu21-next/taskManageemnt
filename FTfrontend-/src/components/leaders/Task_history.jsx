import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { List, Clock, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = "http://localhost:8000";

export default function TaskHistory() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("team"); // my | team
  const [view, setView] = useState("table"); // table | timeline
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchHistories = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_URL}/api/task-histories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.message || "Failed to fetch task histories");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setHistories(data);
        console.log("feched data:", data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch task histories");
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

  const filteredHistory = histories.filter((item) => {
    if (filter === "my" && item.developer !== user.name) return false;
    // if (filter === "team" && item.developer === user.name) return false;
    if (
      search &&
      !item.task.toLowerCase().includes(search.toLowerCase()) &&
      !item.developer.toLowerCase().includes(search.toLowerCase())
    )
      return false;

    if (dateRange.from && new Date(item.date) < new Date(dateRange.from))
      return false;
    if (dateRange.to && new Date(item.date) > new Date(dateRange.to))
      return false;

    return true;
  });
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading task histories...</p>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto bg-gray-100 rounded-lg mx-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold"></h1>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`p-2 rounded-xl flex items-center gap-1 ${
              view === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <List size={18} /> Table
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`p-2 rounded-xl flex items-center gap-1 ${
              view === "timeline"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Clock size={18} /> Timeline
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter("my")}
            className={`px-4 py-1 rounded-lg ${
              filter === "my" ? "bg-emerald-500 text-white" : "text-gray-700"
            }`}
          >
            My History
          </button>
          <button
            onClick={() => setFilter("team")}
            className={`px-4 py-1 rounded-lg ${
              filter === "team" ? "bg-emerald-500 text-white" : "text-gray-700"
            }`}
          >
            Team History
          </button>
        </div>

        {/* Search & Date Range */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center border rounded-lg px-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search task or developer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none px-2 py-1 text-sm"
            />
          </div>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="border rounded-lg px-2 py-1 text-sm"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="border rounded-lg px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Messages */}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {/* Content */}
      {!loading && !error && (
        <div className="  rounded-2xl p-4">
          {filteredHistory.length === 0 ? (
            <p className="text-gray-400 text-center">No history found.</p>
          ) : view === "table" ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="px-2 py-3">Task</th>
                    <th className="px-2 py-3">Developer</th>
                    <th className="px-2 py-3">Old Status</th>
                    <th className="px-2 py-3">New Status</th>
                    <th className="px-2 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-3 font-base break-words">
                        {item.task.split(" ").map((word, index) =>
                          index % 3 === 0 && index !== 0 ? (
                            <>
                              <br key={index} />
                              {word}{" "}
                            </>
                          ) : (
                            word + " "
                          )
                        )}
                      </td>
                      <td className="px-2 py-3 flex items-center gap-2">
                        {item.profile_photo && (
                          <img
                            src={
                              item.profile_photo.startsWith("http")
                                ? item.profile_photo
                                : `${API_URL}/storage/${item.profile_photo}`
                            }
                            alt={item.developer}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        {item.developer}
                      </td>
                      <td className="px-2 py-3 text-gray-400">
                        {item.oldStatus}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            item.newStatus === "Completed"
                              ? "bg-green-100 text-green-600"
                              : item.newStatus === "In Progress"
                              ? "bg-blue-100 text-blue-600"
                              : item.newStatus === "Under Review"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.newStatus}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-sm text-gray-500">
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {filteredHistory.map((item) => (
                <div key={item.id} className="relative pl-6 border-l">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500"></span>
                  <p className="font-medium">
                    <span className="text-violet-500">{item.developer}</span>{" "}
                    updated{" "}
                    <span className="text-neutral-500">{item.task}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.oldStatus} →{" "}
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold break-words whitespace-normal ${
                        item.newStatus === "Completed"
                          ? "bg-green-100 text-green-600"
                          : item.newStatus === "In Progress"
                          ? "bg-blue-100 text-blue-600"
                          : item.newStatus === "Under Review"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.newStatus}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
