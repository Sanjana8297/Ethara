# Ethara - Project & Task Management Web Application

A simplified Trello/Asana-like web application for project and task management with user authentication, role-based access control, and analytics dashboard.

## Features

### User Authentication
- Signup with Name, Email, Password
- Secure login with JWT tokens
- Persistent authentication

### Project Management
- Create projects (creator becomes Admin)
- Add/remove project members
- View assigned projects
- Team member management with role assignment

### Task Management
- Create tasks with Title, Description, Due Date, Priority
- Assign tasks to team members
- Update task status (To Do, In Progress, Done)
- Delete tasks (Admin only)
- View task details and history

### Dashboard
- Total projects count
- Total tasks across projects
- Tasks assigned to current user
- Overdue tasks count
- Tasks breakdown by status

### Role-Based Access Control
- **Admin**: Full project and task management, member management
- **Member**: View and update only assigned tasks, view project details

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT
- **HTTP Client**: Axios

## Project Structure

```
ethara/
├── backend/              # Express server
│   ├── src/
│   │   ├── db/          # Database initialization
│   │   ├── routes/      # API routes (auth, projects, tasks, dashboard)
│   │   ├── middleware/  # Authentication middleware
│   │   ├── types/       # TypeScript types
│   │   └── index.ts     # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # React application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── types/       # TypeScript types
│   │   ├── api.ts       # API client
│   │   ├── AuthContext.tsx # Auth state management
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── .github/
    └── copilot-instructions.md
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npm run db:init
```

5. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### Running Both Simultaneously

From root directory:
```bash
npm install
npm run dev
```

This will start both backend and frontend concurrently.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `POST /api/projects` - Create project (protected)
- `GET /api/projects` - List user's projects (protected)
- `GET /api/projects/:id` - Get project details (protected)
- `POST /api/projects/:id/members` - Add member (Admin only)
- `GET /api/projects/:id/members` - List project members (protected)
- `DELETE /api/projects/:id/members/:userId` - Remove member (Admin only)

### Tasks
- `POST /api/tasks` - Create task (Admin only)
- `GET /api/tasks/project/:projectId` - Get project tasks (protected)
- `GET /api/tasks/:id` - Get task details (protected)
- `PUT /api/tasks/:id` - Update task (Admin or assigned member)
- `DELETE /api/tasks/:id` - Delete task (Admin only)

### Dashboard
- `GET /api/dashboard` - Get dashboard stats (protected)

## Usage Guide

### 1. Create Account
- Visit `http://localhost:3000/signup`
- Enter Name, Email, and Password
- Click "Sign Up"

### 2. Create Project
- Navigate to Projects page
- Click "Create Project"
- Enter project name and description
- You become the Admin automatically

### 3. Add Team Members
- Go to project details
- Team members section shows current members
- As Admin, use API to add members: `POST /api/projects/{projectId}/members`

### 4. Create Tasks
- In project details, click "Create Task"
- Fill in task details (title, description, priority, due date)
- Assign to a team member
- Task is created with "To Do" status

### 5. Track Progress
- Update task status as work progresses
- Members can only update their assigned tasks
- Admins can manage all tasks
- Dashboard shows overall progress

## Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## Database Schema

### Users
- id, name, email, password (hashed), createdAt

### Projects
- id, name, description, adminId, createdAt

### Project Members
- projectId, userId, role (Admin/Member), joinedAt

### Tasks
- id, projectId, title, description, status, priority, assignedTo, dueDate, createdAt, updatedAt

## Development Notes

- All passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- Frontend stores token in localStorage
- Database auto-creates tables on first run
- Foreign key constraints are enabled for data integrity

## Testing the Application

1. Create two user accounts (admin and member)
2. Admin creates a project
3. Admin adds member to project
4. Admin creates tasks and assigns to member
5. Member logs in and views assigned tasks
6. Both users check dashboard stats
7. Member updates task status
8. Admin verifies changes

## Future Enhancements

- Task comments and activity logs
- File attachments
- Email notifications
- Task templates
- Advanced filtering and search
- Project analytics and reports
- Team collaboration features
- Mobile responsive design

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Ensure all dependencies are installed: `npm install`
- Check .env file is created and configured

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check CORS is properly configured
- Verify proxy in vite.config.ts

### Database errors
- Delete data folder and re-run `npm run db:init`
- Ensure write permissions in project directory

## License

MIT
