import React, { useState, useEffect } from "react";
import {
  MdOutlineDashboard,
  MdOutlineTask,
  MdOutlineComment,
  MdSettings,
  MdHistory,
  MdMenu,
} from "react-icons/md";
import {
  BsCheckCircle,
  BsClock,
  // BsFileText,
  BsChatLeftText,
} from "react-icons/bs";
import { FiRefreshCcw } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useAuth } from "../../contexts/AuthContext";
import Settings from "../../components/Settings";
import Tasks from "../../components/developers/Tasks";
import Comments from "../../components/developers/Comments";
import Performances from "../../components/developers/performance";
const API_URL = "http://127.0.0.1:8000/api";

const Dashboard = () => {
  const { user, logout, newTasksCount, setNewTasksCount } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  if (!user) {
    return <div>Loading user data...</div>;
  }
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [sidebarOpen]);

  const handleDashboardClick = (e) => {
    e.preventDefault();
    setActivePage("dashboard");
    setSidebarOpen(false);
  };
  const fetchNewComments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/comments/new", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await res.json();
      setNewCommentsCount(data.new_comments_count);
    } catch (err) {
      console.error(err);
    }
  };
  // --- Mark comments as seen ---
  const markCommentsAsSeen = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/comments/mark-seen", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      setNewCommentsCount(0);
    } catch (err) {
      console.error("Failed to mark comments as seen:", err);
    }
  };
  // --- Load comments from API ---
  const loadComments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/comments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await res.json();
      setNewCommentsCount(data.new_comments_count);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };
  // --- Handle sidebar click ---
  const handleCommentsClick = async (e) => {
    e.preventDefault();
    setActivePage("comments");
    setSidebarOpen(false);

    // Load comments first
    await loadComments();

    // After comments are loaded, mark them as seen
    await markCommentsAsSeen();
  };

  // --- Polling setup ---
  useEffect(() => {
    fetchNewComments(); // initial fetch
    const interval = setInterval(fetchNewComments, 3000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSettingsClick = (e) => {
    e.preventDefault();
    setActivePage("settings");
    setSidebarOpen(false);
  };
  const handlePerformancesClick = (e) => {
    e.preventDefault();
    setActivePage("performances");
    setSidebarOpen(false);
  };
  //   const handleCommentsClick = (e) => {
  //   e.preventDefault();
  //   setActivePage('comments');
  // };
  const pageTitles = {
    dashboard: "Dashboard",
    settings: "Settings",
    tasks: "Tasks",
    comments: "Comments",
    performances: "Performances",
  };
  const getUserAvatar = (user) => {
    if (user?.profile_photo) {
      return user.profile_photo.startsWith("http")
        ? user.profile_photo
        : `http://127.0.0.1:8000/storage/${
            user.profile_photo
          }?t=${new Date().getTime()}`;
    }
    return null; // important: return null instead of empty string
  };

  const getUserInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleTasksClick = async (e) => {
    e.preventDefault();
    setSidebarOpen(false);
    setActivePage("tasks");
    try {
      const res = await fetch(`${API_URL}/mark-seen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (res.ok) {
        // ✅ reset badge globally (not 0 → null)
        setNewTasksCount(null);
        localStorage.removeItem("newTasksCount"); // optional, clears storage
      } else {
        const data = await res.json();
        console.error("Failed to mark tasks seen:", data.message);
      }
    } catch (err) {
      console.error("Error marking tasks as seen:", err);
    }
  };
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 min-h-screen w-64 bg-[#232323] text-gray-200 flex flex-col p-4 transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:static lg:block`}
      >
        <div className="flex flex-col items-center space-x-3 mb-6">
          {getUserAvatar(user) ? (
            <img
              src={getUserAvatar(user)}
              alt={user.name}
              className="rounded-full w-16 h-16 object-cover cursor-pointer transform transition duration-300 hover:scale-125"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-400 flex items-center justify-center text-white font-bold text-3xl cursor-pointer transform transition duration-300 hover:scale-125">
              {getUserInitials(user.name)}
            </div>
          )}
          <div className="text-center">
            <h2 className="text-lg font-medium text-white">{user.name}</h2>
            <p className="text-sm text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>
        <nav className="flex-1">
          <ul>
            <li className="mb-2">
              <a
                href="#"
                onClick={handleDashboardClick}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  activePage === "dashboard"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <MdOutlineDashboard size={20} />
                <span>Dashboard</span>
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                onClick={handleTasksClick}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activePage === "tasks"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MdOutlineTask size={20} />
                  <span>Tasks</span>
                </div>
                {newTasksCount > 0 && (
                  <span className="bg-[#00C951] text-white text-xs px-2 rounded-full">
                    {newTasksCount}
                  </span>
                )}
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                onClick={handleCommentsClick}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activePage === "comments"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MdOutlineComment size={20} />
                  <span>Comments</span>
                </div>
                {newCommentsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                    {newCommentsCount}
                  </span>
                )}
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                onClick={handlePerformancesClick}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activePage === "performances"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <MdHistory size={20} />
                <span>Performance history</span>
              </a>
            </li>
            {/* <li className='mb-2'>
              <a href='#' className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition duration-200'>
                <div className='flex items-center space-x-3'>
                  <MdNotifications size={20} />
                  <span>Notifications</span>
                </div>
                <span className='bg-[#00C951] text-white text-xs px-2 rounded-full'>3</span>
              </a>
            </li> */}
          </ul>

          <div className="mt-auto">
            <a
              href="#"
              onClick={handleSettingsClick}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                activePage === "settings"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              <MdSettings size={20} />
              <span>Settings</span>
            </a>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 lg:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <button
          className="lg:hidden text-2xl mr-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MdMenu />
        </button>
        <h1 className="text-3xl font-bold text-gray-800 capitalize">
          {pageTitles[activePage] || "Page"}
        </h1>
        <div className="flex justify-end mb-6">
          <button
            onClick={logout}
            className="cursor-pointer text-[#bb2d3b] text-base hover:text-[#f59e0b]"
          >
            Logout
          </button>
        </div>
        {activePage === "dashboard" && <DashboardContent />}
        {activePage === "settings" && <Settings />}
        {activePage === "tasks" && <Tasks />}
        {activePage === "comments" && <Comments />}
        {activePage === "performances" && <Performances />}
      </main>
    </div>
  );
};

export default Dashboard;
const DashboardContent = () => {
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    in_progress: 0,
    under_review: 0,
    completed: 0,
  });

  const [performanceOverview, setPerformanceOverview] = useState({
    tasks_completed_this_week: 0,
    on_time_completion_rate: 0,
  });

  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState({
    overdue_tasks: [],
    recent_updates: [],
  });
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/Devtasks", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setStatusCounts(data.status_counts);
        }
      } catch (err) {
        console.error("Error fetching task status counts:", err);
      }
    };
    // Fetch summary data for performance, deadlines, activity, notifications
    const fetchSummary = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/summary", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setPerformanceOverview(data.performance_overview);
          setUpcomingDeadlines(data.upcoming_deadlines);
          setRecentActivity(data.recent_activity);
          setNotifications(data.notifications);
        }
        console.log("feched dd:", data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };
    fetchTasks();
    fetchSummary();
  }, []);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard
          color="gray"
          title="Total Tasks"
          count={statusCounts.total}
          icon={<FiRefreshCcw size={24} />}
        />
        <StatusCard
          color="blue"
          title="In Progress"
          count={statusCounts.in_progress}
          icon={<BsCheckCircle size={24} />}
        />
        <StatusCard
          color="orange"
          title="Under Review"
          count={statusCounts.under_review}
          icon={<BsClock size={24} />}
        />
        <StatusCard
          color="green"
          title="Completed"
          count={statusCounts.completed}
          icon={<IoCheckmarkCircleOutline size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PerformanceOverview data={performanceOverview} />
        <UpcomingDeadlines data={upcomingDeadlines} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivity data={recentActivity} />
        <Notifications data={notifications} />
      </div>
    </>
  );
};
const StatusCard = ({ color, title, count, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-full text-white bg-${color}-500`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{count}</p>
    </div>
  </div>
);

const PerformanceOverview = ({ data }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">
      Performance overview
    </h3>
    <p className="text-sm text-gray-600 mb-2">
      {data.tasks_completed_this_week} Tasks completed this week
    </p>
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${data.on_time_completion_rate}%` }}
      ></div>
    </div>
    <p className="text-sm text-gray-600">
      {data.on_time_completion_rate}% On-time completion rate
    </p>
  </div>
);

const UpcomingDeadlines = ({ data }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">
      Upcoming deadlines
    </h3>
    <ul>
      {data.map((task) => (
        <li key={task.id} className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-800">
            <span className="text-gray-600">{task.title}</span>
          </span>
          <span className="text-xs text-gray-500">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const RecentActivity = ({ data }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">
      Recent activity
    </h3>
    <ul>
      {data.map((comment) => (
        <li key={comment.id} className="flex items-start mb-4">
          <BsChatLeftText size={16} className="text-gray-500 mr-3 mt-1" />
          <div className="flex-1">
            <p className="text-sm text-gray-800">
              <span className="text-green-600">{comment.user.name}</span>:{" "}
              {comment.comment_text}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
const Notifications = ({ data }) => {
  const overdueTasks = data?.overdue_tasks || [];
  const recentCompletedTasks = data?.recent_completed_tasks || [];
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Notifications
      </h3>
      <ul>
        {overdueTasks.length === 0 && recentCompletedTasks.length === 0 && (
          <li className="text-sm text-gray-500">No notifications available</li>
        )}
        {overdueTasks.map((task) => (
          <li key={task.id} className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-800">
              Task '{task.title}' is{" "}
              <span className="text-red-400"> overdue</span>
            </span>
            <span className="text-xs text-gray-500">
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          </li>
        ))}
        {recentCompletedTasks.map((task) => (
          <li key={task.id} className="flex justify-between items-center">
            <span className="text-sm text-gray-800">
              Task '{task.title}' has been{" "}
              <span className="text-green-500">completed</span>
            </span>
            <span className="text-xs text-gray-500">
              {new Date(task.updated_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
