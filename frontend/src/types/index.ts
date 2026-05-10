export type UserRole = 'Admin' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  adminId: string;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  assignedTasks: number;
  overdueTasks: number;
  tasksByStatus: {
    [key: string]: number;
  };
}
