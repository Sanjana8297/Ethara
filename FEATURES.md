# Ethara - Complete Application Guide

## ✅ All Features Implemented

### 1. **User Authentication** 
- ✅ Signup with Name, Email, Password
- ✅ Login with Email/Password
- ✅ JWT token-based authentication
- ✅ Secure password hashing with bcryptjs
- ✅ Protected API endpoints
- ✅ Auto-logout on token expiration

### 2. **Project Management**
- ✅ Create projects (creator becomes Admin)
- ✅ View all assigned projects
- ✅ Project details with members
- ✅ Add team members to projects
- ✅ Remove team members
- ✅ Role-based member management (Admin/Member)

### 3. **Task Management**
- ✅ Create tasks (Admin only)
- ✅ Assign tasks to team members
- ✅ View all project tasks
- ✅ Update task status (To Do → In Progress → Done)
- ✅ Update task details
- ✅ Delete tasks (Admin only)
- ✅ Set priority levels (Low, Medium, High)
- ✅ Set due dates

### 4. **Dashboard Analytics**
- ✅ Total projects count
- ✅ Total tasks count
- ✅ Tasks assigned to me
- ✅ Overdue tasks warning
- ✅ Tasks breakdown by status

### 5. **Role-Based Access Control**
- ✅ Admin: Full project management
- ✅ Admin: Can create/delete/update any task
- ✅ Admin: Can manage team members
- ✅ Member: Can only view project details
- ✅ Member: Can only update assigned tasks

### 6. **Technical Features**
- ✅ SQLite persistent database
- ✅ Express REST API
- ✅ React frontend with routing
- ✅ TypeScript for type safety
- ✅ CORS support
- ✅ Error handling
- ✅ Input validation

## Project Structure

```
Ethara/
├── Backend (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── db/               # Database initialization
│   │   │   ├── index.ts      # Database connection & schema
│   │   │   └── init.ts       # DB init script
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript interfaces
│   │   ├── middleware/
│   │   │   └── auth.ts       # JWT authentication
│   │   └── routes/
│   │       ├── auth.ts       # Auth endpoints
│   │       ├── projects.ts   # Project endpoints
│   │       ├── tasks.ts      # Task endpoints
│   │       └── dashboard.ts  # Dashboard endpoints
│   ├── dist/                 # Compiled output
│   └── package.json
│
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── main.tsx          # Entry point
│   │   ├── App.tsx           # Router & navigation
│   │   ├── api.ts            # API client
│   │   ├── AuthContext.tsx   # Auth state
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript types
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   └── ProjectDetailPage.tsx
│   │   ├── components/       # Reusable components
│   │   └── hooks/            # Custom hooks
│   ├── dist/                 # Build output
│   └── package.json
│
├── .vscode/
│   ├── tasks.json            # Development tasks
│   └── launch.json           # Debug configuration
│
├── .github/
│   └── copilot-instructions.md
│
├── QUICK_START.md            # Quick start guide
├── README.md                 # Full documentation
├── package.json              # Root workspace
└── .gitignore
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create project (protected) |
| GET | `/api/projects` | List user's projects (protected) |
| GET | `/api/projects/:id` | Get project details (protected) |
| POST | `/api/projects/:id/members` | Add member (Admin only) |
| GET | `/api/projects/:id/members` | List members (protected) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin only) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task (Admin only) |
| GET | `/api/tasks/project/:projectId` | Get project tasks (protected) |
| GET | `/api/tasks/:id` | Get task details (protected) |
| PUT | `/api/tasks/:id` | Update task (Admin or assigned) |
| DELETE | `/api/tasks/:id` | Delete task (Admin only) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard stats (protected) |

## Testing Guide

### Test 1: User Registration & Login
1. Go to http://localhost:3000/signup
2. Create account: Name="Alice", Email="alice@example.com", Password="password123"
3. Auto-login and redirect to dashboard
4. Create another account: Name="Bob", Email="bob@example.com", Password="password123"

### Test 2: Project Creation
1. As Alice, go to Projects page
2. Click "Create Project"
3. Enter: Name="Website Redesign", Description="Redesign company website"
4. Alice becomes Admin automatically
5. Verify project appears in project list

### Test 3: Add Team Members
Using API (with Alice's token):
```bash
curl -X POST http://localhost:5000/api/projects/{projectId}/members \
  -H "Authorization: Bearer {alice-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "{bob-user-id}",
    "role": "Member"
  }'
```

Or use the browser's network tab to capture Bob's user ID from login response.

### Test 4: Create Tasks
1. As Alice (Admin), go to project details
2. Click "Create Task"
3. Create task: 
   - Title: "Design Homepage"
   - Description: "Create new homepage design mockups"
   - Priority: "High"
   - Due Date: "2026-05-31"
   - Assign To: Bob
4. Create another task assigned to Bob

### Test 5: Task Status Updates
1. As Alice, update task status from "To Do" → "In Progress"
2. Logout and login as Bob
3. View the task assigned to him
4. Update status to "In Progress" then "Done"
5. Verify only assigned member can update

### Test 6: Role Permissions
As Bob (Member):
- ✅ Can view project details
- ✅ Can update assigned tasks
- ✅ Can change task status
- ❌ Cannot create tasks
- ❌ Cannot delete tasks
- ❌ Cannot add/remove members

### Test 7: Dashboard Stats
1. Go to Dashboard
2. Verify stats show:
   - Total projects (should show Alice's projects)
   - Total tasks (all tasks across projects)
   - Assigned tasks (tasks assigned to current user)
   - Overdue tasks (tasks with past due date and status ≠ Done)
   - Breakdown by status

### Test 8: Permissions Verification
Using API to test Admin-only endpoints:

**Create task as member (should fail):**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer {bob-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "{projectId}",
    "title": "Test",
    "description": "Test",
    "priority": "High"
  }'
```

Should return: `"Only admins can create tasks"`

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL (hashed),
  createdAt TEXT NOT NULL
)
```

### Projects Table
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  adminId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (adminId) REFERENCES users(id)
)
```

### Project Members Table
```sql
CREATE TABLE project_members (
  projectId TEXT NOT NULL,
  userId TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'Admin' or 'Member'
  joinedAt TEXT NOT NULL,
  PRIMARY KEY (projectId, userId),
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (userId) REFERENCES users(id)
)
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,  -- 'To Do', 'In Progress', 'Done'
  priority TEXT NOT NULL,  -- 'Low', 'Medium', 'High'
  assignedTo TEXT,
  dueDate TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (assignedTo) REFERENCES users(id)
)
```

## Configuration

### Backend Environment Variables (.env)
```
PORT=5000
JWT_SECRET=dev-secret-key-change-in-production
```

### Frontend Configuration (vite.config.ts)
- Frontend port: 3000
- API proxy: /api → http://localhost:5000
- Build output: frontend/dist/

### Database Location
- SQLite file: backend/data/ethara.db
- Auto-created on first run

## Development Workflow

1. **Start Dev Servers**: `npm run dev`
2. **Backend changes**: Auto-reload with tsx watch
3. **Frontend changes**: Hot reload with Vite HMR
4. **Build for production**: `npm run build`

## Common Commands

```bash
# Install all dependencies
npm install

# Start development servers
npm run dev

# Run backend only
npm run backend:dev

# Run frontend only  
npm run frontend:dev

# Build both
npm run build

# Build backend
npm run -w backend build

# Build frontend
npm run -w frontend build

# Initialize database
npm run -w backend db:init

# Start production backend
npm run -w backend start
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
# Or change PORT in backend/.env
```

### Database Errors
```bash
# Reset database
rm -rf backend/data/
npm run -w backend db:init
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Build to check for errors
npm run build
```

## Security Notes

- ⚠️ Change JWT_SECRET in production
- ⚠️ Enable HTTPS in production
- ⚠️ Use environment variables for secrets
- ⚠️ Implement rate limiting for API
- ⚠️ Add input validation and sanitization
- ✅ All passwords are hashed with bcryptjs
- ✅ Foreign keys enabled in SQLite
- ✅ JWT tokens expire after 24 hours

## Future Enhancements

- [ ] Task comments and activity logs
- [ ] File attachments
- [ ] Email notifications
- [ ] Task templates
- [ ] Advanced filtering and search
- [ ] Project analytics and reports
- [ ] Real-time updates with WebSockets
- [ ] Mobile app
- [ ] Dark mode

## Support

For detailed information, see:
- [README.md](./README.md) - Full documentation
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [Backend code](./backend/src) - Source code
- [Frontend code](./frontend/src) - Source code
