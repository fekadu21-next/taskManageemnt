import React, { useState, useEffect } from "react";
import {
  MdOutlineDashboard,
  // MdOutlineLibraryBooks,
  MdGroups,
  // MdOutlinePerson,
  MdOutlineTask,
  MdOutlineComment,
  MdHistory,
  // MdNotifications,
  MdMenu,
  MdSettings,
} from "react-icons/md";
import { FaProjectDiagram } from "react-icons/fa";
import { FiCheckCircle, FiRefreshCcw, FiSearch } from "react-icons/fi";
import { GiCheckMark } from "react-icons/gi";
import { useAuth } from "../../contexts/AuthContext";
import Settings from "../../components/Settings";
import Projects from "../../components/leaders/Projects";
import TeamMembers from "../../components/leaders/Team_members";
import Tasks from "../../components/leaders/Assigntasks";
import Mytasks from "../../components/leaders/Reviewtask";
import Comments from "../../components/leaders/Comments";
import TaskHistory from "../../components/leaders/Task_history";
const API_URL = "http://127.0.0.1:8000/api";
const Dashboard = () => {
  const { user, logout, newTasksCount, setNewTasksCount } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);

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

  // --- Fetch new comments count periodically ---
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
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);
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
    const interval = setInterval(fetchNewComments, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSettingsClick = (e) => {
    e.preventDefault();
    setActivePage("settings");
    setSidebarOpen(false);
  };
  const handleTasksClick = (e) => {
    e.preventDefault();
    setActivePage("tasks");
    setSidebarOpen(false);
  };
  const handleTaskHistoryClick = (e) => {
    e.preventDefault();
    setActivePage("taskhistory");
    setSidebarOpen(false);
  };
  // const handleCommentsClick = async (e) => {
  //   e.preventDefault();

  //   // Mark comments as seen via your API
  //   try {
  //     await fetch("http://127.0.0.1:8000/api/comments/mark-seen", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     setNewCommentsCount(0); // clear badge locally
  //   } catch (err) {
  //     console.error("Error marking comments as seen:", err);
  //   }

  //   setActivePage('comments');
  //   setSidebarOpen(false);
  // };

  const handleTeamMembersClick = (e) => {
    e.preventDefault();
    setActivePage("teammembers");
    setSidebarOpen(false);
  };
  const handleMytasksClick = async (e) => {
    e.preventDefault();
    setActivePage("mytasks");
    setSidebarOpen(false);
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
  const handleProjectsClick = (e) => {
    e.preventDefault();
    setActivePage("projects");
    setSidebarOpen(false);
  };
  const pageTitles = {
    dashboard: "Dashboard",
    settings: "Settings",
    projects: "Projects",
    teammembers: "TeamMembers",
    tasks: "Tasks",
    mytasks: "Mytasks",
    comments: "Comments",
    taskhistory: "TaskHistory",
  };
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      {/* <aside className='w-64 bg-[#232323] text-gray-200 flex flex-col p-4'> */}
      <aside
        className={`fixed top-0 left-0 z-50 min-h-screen w-64 bg-[#232323] text-gray-200 flex flex-col p-4 transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 lg:static lg:block`}
      >
        <div className="flex flex-col items-center space-x-3 mb-6 ">
          <img
            src={user?.profile_photo || "https://i.pravatar.cc/48"}
            alt={user?.name || "User"}
            className="rounded-full w-16 h-16 object-cover cursor-pointer transform transition duration-300 hover:scale-125"
          />
          <div className="text-center">
            <h2 className="text-lg font-medium text-white">{user.name}</h2>
            <p className="text-sm text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>
        <nav className=" flex-1">
          <ul>
            <li className="mb-1.5">
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
            <li className="mb-1.5">
              <a
                href="#"
                onClick={handleProjectsClick}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activePage === "projects"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <FaProjectDiagram size={20} />
                <span>Projects</span>
              </a>
            </li>
            <li className="mb-1.5">
              <a
                href="#"
                onClick={handleTeamMembersClick}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activePage === "teammembers"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <MdGroups size={20} />
                <span>Team Members</span>
              </a>
            </li>
            <li className="mb-1.5">
              <a
                href="#"
                onClick={handleTasksClick}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activePage === "tasks"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <MdOutlineTask size={20} />
                <span>Assign tasks</span>
              </a>
            </li>
            <li className="mb-1.5">
              <a
                href="#"
                onClick={handleMytasksClick}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activePage === "mytasks"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MdOutlineTask size={20} />
                  <span>My tasks</span>
                </div>
                {newTasksCount > 0 && (
                  <span className="bg-[#00C951] text-white text-xs px-2 rounded-full">
                    {newTasksCount}
                  </span>
                )}
              </a>
            </li>
            <li className="mb-1.5">
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
                {/* <span className='bg-red-500 text-white text-xs px-2 rounded-full'>{newCommentsCount}</span> */}
                {newCommentsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                    {newCommentsCount}
                  </span>
                )}
              </a>
            </li>
            <li className="mb-1.5">
              <a
                href="#"
                onClick={handleTaskHistoryClick}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activePage === "taskhistory"
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <MdHistory size={20} />
                <span>Task History</span>
              </a>
            </li>
            {/* <li className='mb-2'>
              <a
                href='#'
                className='flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <MdNotifications size={20} />
                  <span>Notifications</span>
                </div>
                <span className='bg-red-500 text-white text-xs px-2 rounded-full'>5</span>
              </a>
            </li> */}
            <li>
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
            </li>
          </ul>
        </nav>
        {/* <a
            href="#"
            onClick={handleSettingsClick}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
              activePage === 'settings' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
            }`}
          >
            <MdSettings size={20} />
            <span>Settings</span>
          </a> */}
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 lg:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <div className="flex justify-between items-center mb-6">
          <button
            className="lg:hidden text-2xl mr-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MdMenu />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">
            {pageTitles[activePage] || "Page"}
          </h1>
          <button
            onClick={logout}
            className="cursor-pointer text-[#bb2d3b] text-base p-0 leading-none  mb-2 hover:text-[#f59e0b]"
          >
            Logout
          </button>
        </div>
        {(() => {
          if (activePage === "dashboard") {
            return (
              <>
                {/* Status cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-500 rounded-full text-white">
                      <FiCheckCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To Do</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {dashboardData ? dashboardData.todo_count : 0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-purple-500 rounded-full text-white">
                      <FiRefreshCcw size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">In Progress</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {dashboardData ? dashboardData.in_progress_count : 0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-orange-500 rounded-full text-white">
                      <FiSearch size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Under Review</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {dashboardData ? dashboardData.under_review_count : 0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-500 rounded-full text-white">
                      <GiCheckMark size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {dashboardData ? dashboardData.completed_count : 0}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Tasks section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Tasks
                    </h3>
                    <div className="space-y-4">
                      {dashboardData && (
                        <>
                          {/* Total Tasks */}
                          <p className="text-teal-600  m-0">total tasks</p>
                          <div
                            className="flex items-center justify-between"
                            title="Total tasks assigned"
                          >
                            <div className="h-2 bg-gray-200 rounded w-full relative">
                              <div
                                className="absolute top-0 left-0 h-2 bg-blue-500 rounded"
                                style={{ width: "100%" }} // total always 100%
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              {dashboardData.total_tasks}
                            </span>
                          </div>
                          {/* In Progress Tasks */}
                          <p className="text-teal-600  m-0">in progress</p>
                          <div
                            className="flex items-center justify-between"
                            title="Tasks currently in progress"
                          >
                            <div className="h-2 bg-gray-200 rounded w-full relative">
                              <div
                                className="absolute top-0 left-0 h-2 bg-yellow-500 rounded"
                                style={{
                                  width: `${
                                    dashboardData.total_tasks > 0
                                      ? (dashboardData.in_progress_count /
                                          dashboardData.total_tasks) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              {dashboardData.in_progress_count}
                            </span>
                          </div>
                          {/* Completed Tasks */}
                          <p className="text-teal-600  m-0">completed tasks</p>
                          <div
                            className="flex items-center justify-between"
                            title="Tasks completed successfully"
                          >
                            <div className="h-2 bg-gray-200 rounded w-full relative">
                              <div
                                className="absolute top-0 left-0 h-2 bg-green-500 rounded"
                                style={{
                                  width: `${
                                    dashboardData.total_tasks > 0
                                      ? (dashboardData.completed_count /
                                          dashboardData.total_tasks) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              {dashboardData.completed_count}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Task List
                    </h3>
                    <div className="space-y-4">
                      {dashboardData?.recent_completed_tasks.length > 0 ? (
                        dashboardData.recent_completed_tasks.map(
                          (task, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-2 bg-gray-100 rounded"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-700">
                                  {task.task_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Completed by: {task.completed_by}
                                </p>
                              </div>
                              <span className="text-sm text-gray-500">
                                {task.completed_at}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        // fallback if no tasks
                        <>
                          <div className="h-2 w-full bg-gray-200 rounded"></div>
                          <div className="h-2 w-full bg-gray-200 rounded"></div>
                          <div className="h-2 w-full bg-gray-200 rounded"></div>
                          <div className="h-2 w-full bg-gray-200 rounded"></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          } else if (activePage === "settings") {
            return <Settings />;
          } else if (activePage === "projects") {
            return <Projects />;
          } else if (activePage === "teammembers") {
            return <TeamMembers />;
          } else if (activePage === "mytasks") {
            return <Mytasks />;
          } else if (activePage === "comments") {
            return <Comments />;
          } else if (activePage === "taskhistory") {
            return <TaskHistory />;
          } else if (activePage === "tasks") {
            return <Tasks />;
          } else {
            return <div>Page not found</div>;
          }
        })()}
      </main>
    </div>
  );
};
export default Dashboard;
