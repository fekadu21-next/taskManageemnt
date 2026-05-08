# Task Management System with Real-Time Notifications

A full-stack task management web application with real-time notifications using Pusher.  
The system helps teams manage tasks, track progress, and collaborate efficiently.

---

# Features

## User Roles

### Admin / Leader
- Create tasks
- Assign tasks to developers
- Update and delete tasks
- View all tasks
- Receive real-time task updates

### Developer
- View assigned tasks
- Update task status
- Add comments to tasks
- Receive task assignment notifications

### Member
- View all tasks
- Add comments
- Receive comment notifications

---

# Real-Time Notifications

Powered by Pusher for instant updates.

## Notification Types
- Task assignment notifications
- Task status update notifications
- Real-time comment notifications
- Browser desktop notifications

## Real-Time Channels
- `user-{userId}`
- `task-{taskId}`

---

# Task Management Features

- Create, update, and delete tasks
- Assign tasks to developers
- Set task priorities
- Track task progress
- Set due dates
- Comment system with history tracking

## Task Priorities
- Low
- Medium
- High

## Task Status
- Pending
- In Progress
- Completed

---

# Tech Stack

## Frontend
- React 18
- React Router DOM
- Axios
- Pusher JS
- CSS3

## Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- Supabase PostgreSQL
- Pusher

---

# Project Structure

```bash
project/
├── server/
│   ├── config/
│   │   ├── database.js
│   │   └── pusher.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── comments.js
│   │   └── notifications.js
│   └── index.js
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── TaskModal.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── TaskDetail.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── database-setup.sql
├── package.json
└── vite.config.js
