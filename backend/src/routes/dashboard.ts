import { Response, Router } from 'express';
import { db } from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Get dashboard stats
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Get user's projects
    const projectsStmt = db.prepare(`
      SELECT COUNT(*) as count FROM projects p
      JOIN project_members pm ON p.id = pm.projectId
      WHERE pm.userId = ?
    `);
    const projectsRow = projectsStmt.get(userId) as any;
    const totalProjects = projectsRow && typeof projectsRow.count !== 'undefined' ? projectsRow.count : 0;

    // Get total tasks
    const totalTasksStmt = db.prepare(`
      SELECT COUNT(*) as count FROM tasks t
      JOIN projects p ON t.projectId = p.id
      JOIN project_members pm ON p.id = pm.projectId
      WHERE pm.userId = ?
    `);
    const totalTasksRow = totalTasksStmt.get(userId) as any;
    const totalTasks = totalTasksRow && typeof totalTasksRow.count !== 'undefined' ? totalTasksRow.count : 0;

    // Get tasks by status
    const statusStmt = db.prepare(`
      SELECT t.status as status, COUNT(*) as count FROM tasks t
      JOIN projects p ON t.projectId = p.id
      JOIN project_members pm ON p.id = pm.projectId
      WHERE pm.userId = ?
      GROUP BY t.status
    `);
    const tasksByStatus = (statusStmt.all(userId) as any) || [];

    // Get assigned tasks count
    const assignedStmt = db.prepare(`
      SELECT COUNT(*) as count FROM tasks
      WHERE assignedTo = ?
    `);
    const assignedRow = assignedStmt.get(userId) as any;
    const assignedTasks = assignedRow && typeof assignedRow.count !== 'undefined' ? assignedRow.count : 0;

    // Get overdue tasks
    const now = new Date().toISOString();
    const overdueStmt = db.prepare(`
      SELECT COUNT(*) as count FROM tasks t
      JOIN projects p ON t.projectId = p.id
      JOIN project_members pm ON p.id = pm.projectId
      WHERE pm.userId = ?
      AND t.dueDate IS NOT NULL
      AND t.dueDate < ?
      AND t.status != 'Done'
    `);
    const overdueRow = overdueStmt.get(userId, now) as any;
    const overdueTasks = overdueRow && typeof overdueRow.count !== 'undefined' ? overdueRow.count : 0;

    res.json({
      totalProjects,
      totalTasks,
      assignedTasks,
      overdueTasks,
      tasksByStatus: tasksByStatus.reduce((acc: any, item: any) => {
        acc[item.status] = item.count;
        return acc;
      }, {})
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
