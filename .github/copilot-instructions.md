# Ethara - Project & Task Management Web Application

Full-stack web application for project and task management with user authentication, role-based access control, and analytics dashboard.

## Project Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (with better-sqlite3)
- **Authentication**: JWT
- **Styling**: Custom CSS

## Setup Progress

- [x] Created .github directory and copilot-instructions.md
- [x] Scaffold backend project with Express, TypeScript, SQLite
- [x] Scaffold frontend project with React, TypeScript, Vite
- [x] Create shared types
- [x] Configure environment files
- [x] Implement authentication (signup, login, JWT)
- [x] Implement project management features (create, manage members)
- [x] Implement task management features (create, update, delete)
- [x] Create dashboard with analytics
- [x] Set up role-based access (Admin vs Member)
- [x] Compile and test
- [x] Create run tasks
- [x] Final documentation

## Running the Application

### Quick Start
```bash
npm install
npm run dev
```

Backend: http://localhost:5000
Frontend: http://localhost:3000

### Separate Terminals
```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend
npm run frontend:dev
```

### VS Code Tasks
Press `Ctrl + Shift + B` and select "Start Dev Servers"

## Features Implemented

✅ **User Authentication**
- Signup with Name, Email, Password
- Secure login with JWT tokens
- Token persistence
- Protected routes

✅ **Project Management**
- Create projects (creator becomes Admin)
- Add/remove project members
- Role-based member management
- View team members

✅ **Task Management**
- Create tasks with Title, Description, Priority, Due Date
- Assign tasks to team members
- Update task status (To Do, In Progress, Done)
- Delete tasks (Admin only)
- Task details view

✅ **Dashboard**
- Total projects count
- Total tasks count
- Tasks assigned to user
- Overdue tasks count
- Tasks breakdown by status

✅ **Role-Based Access Control**
- Admin: Full management permissions
- Member: Limited to assigned tasks

✅ **Database**
- SQLite with persistent storage
- Foreign key constraints
- Automatic table creation

✅ **API**
- RESTful endpoints
- JWT authentication
- Error handling

## Project Structure

```
ethara/
├── backend/          # Express server
│   ├── src/
│   │   ├── db/       # Database setup
│   │   ├── routes/   # API endpoints
│   │   ├── middleware/  # Auth middleware
│   │   ├── types/    # TypeScript types
│   │   └── index.ts  # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React app
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── types/    # TypeScript types
│   │   ├── api.ts    # API client
│   │   ├── App.tsx   # Main app component
│   │   └── main.tsx  # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── .vscode/          # VS Code tasks and launch configs
├── .github/          # GitHub configuration
├── QUICK_START.md    # Quick start guide
├── README.md         # Full documentation
└── package.json      # Root workspace

```

## Key Files

- [README.md](./README.md) - Full documentation and API reference
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [backend/src/index.ts](./backend/src/index.ts) - Backend main entry point
- [frontend/src/App.tsx](./frontend/src/App.tsx) - Frontend main component
- [.vscode/tasks.json](./.vscode/tasks.json) - VS Code development tasks

## Installation & Setup

1. Root directory: `npm install`
2. Backend init: `npm run -w backend db:init`
3. Start servers: `npm run dev`
4. Open browser: http://localhost:3000

## Build Status

✅ Backend: Compiles without errors
✅ Frontend: Builds successfully with Vite
✅ Database: Schema initialized
✅ Dependencies: All installed

## API Endpoints Summary

**Auth**: /api/auth/signup, /api/auth/login, /api/auth/me
**Projects**: /api/projects (CRUD + members)
**Tasks**: /api/tasks (CRUD)
**Dashboard**: /api/dashboard

See README.md for complete API documentation.
