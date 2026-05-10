# Quick Start Guide - Ethara

## Prerequisites
- Node.js 16+ and npm installed
- Visual Studio Code (optional but recommended)

## Installation (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

This installs dependencies for the root workspace, backend, and frontend.

### 2. Initialize Database
```bash
npm run -w backend db:init
```

This creates the SQLite database and initializes tables.

## Running the Application

### Option A: Run Both (Easiest)
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

### Option B: Run Separately
**Terminal 1 - Backend:**
```bash
npm run backend:dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend:dev
```

### Option C: Using VS Code Tasks
1. Press `Ctrl + Shift + B` to open tasks
2. Select "Start Dev Servers"
3. Servers will start in terminal

## First Steps

### 1. Create an Account
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in: Name, Email, Password
4. Click "Sign Up" - You'll be redirected to the dashboard

### 2. Create a Project
1. Click "Projects" in the navigation
2. Click "Create Project"
3. Fill in project name and description
4. You become the Admin automatically

### 3. Add Team Members
To add members to your project, use the API:

```bash
curl -X POST http://localhost:5000/api/projects/{projectId}/members \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "{member-user-id}",
    "role": "Member"
  }'
```

### 4. Create Tasks
1. Go to your project
2. Click "Create Task" (Admin only)
3. Fill in: Title, Description, Priority, Due Date, Assign To
4. Tasks start with "To Do" status

### 5. Update Task Status
1. Click on any task
2. Change status from dropdown (To Do → In Progress → Done)
3. Members can only update their assigned tasks
4. Admins can update all tasks

### 6. View Dashboard
1. Click "Dashboard" in navigation
2. See your project/task statistics
3. View overdue tasks and task breakdown

## Development

### Build
```bash
npm run build
```

### Format
Frontend uses React with TypeScript
Backend uses Express with TypeScript

### Testing
Manual testing:
1. Create multiple accounts
2. Create projects with different roles
3. Assign tasks and update status
4. Check dashboard stats

## Stopping Servers

Press `Ctrl + C` in each terminal to stop the servers.

## Troubleshooting

### "Port 5000 already in use"
Backend port is busy. Either:
- Kill the process using port 5000
- Edit backend/.env and change PORT

### "Port 3000 already in use"
Frontend port is busy. Edit frontend/vite.config.ts and change port.

### "Database errors"
Delete the `data/` folder and re-run:
```bash
npm run -w backend db:init
```

### "npm install fails"
Clear npm cache and try again:
```bash
npm cache clean --force
npm install
```

## API Documentation

See [README.md](./README.md#api-endpoints) for detailed API endpoints.

## Project Structure

```
ethara/
├── backend/          # Express API server
│   ├── src/
│   │   ├── db/       # Database init
│   │   ├── routes/   # API endpoints
│   │   ├── middleware/ # Auth middleware
│   │   ├── types/    # TypeScript types
│   │   └── index.ts  # Main server
│   └── package.json
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── api.ts    # API client
│   │   ├── App.tsx   # Main app
│   │   └── main.tsx  # Entry point
│   └── package.json
├── .vscode/          # VS Code settings
├── .github/          # GitHub configs
└── README.md         # Full documentation
```

## Next Steps

1. Explore the code in VS Code
2. Read [README.md](./README.md) for full documentation
3. Try creating multiple projects and tasks
4. Test role-based permissions

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- Review the code in `src/` directories
- Check API responses in browser DevTools Network tab

Happy building! 🚀
