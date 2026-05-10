import { Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Create task
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId, title, description, priority, dueDate, assignedTo } = req.body;
    const userId = req.user?.userId;

    // Verify user is admin in project
    const adminStmt = db.prepare(
      'SELECT * FROM project_members WHERE projectId = ? AND userId = ? AND role = ?'
    );
    if (!adminStmt.get(projectId, userId, 'Admin')) {
      return res.status(403).json({ error: 'Only admins can create tasks' });
    }

    const taskId = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO tasks (id, projectId, title, description, status, priority, assignedTo, dueDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      taskId,
      projectId,
      title,
      description || '',
      'To Do',
      priority || 'Medium',
      assignedTo || null,
      dueDate || null,
      now,
      now
    );

    res.status(201).json({
      id: taskId,
      projectId,
      title,
      description,
      status: 'To Do',
      priority: priority || 'Medium',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdAt: now,
      updatedAt: now
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get project tasks
router.get('/project/:projectId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    // Verify user is a member
    const memberStmt = db.prepare('SELECT * FROM project_members WHERE projectId = ? AND userId = ?');
    if (!memberStmt.get(projectId, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stmt = db.prepare('SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt DESC');
    const tasks = stmt.all(projectId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task details
router.get('/:taskId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.userId;

    const taskStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = taskStmt.get(taskId) as any;

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user is a member of the project
    const memberStmt = db.prepare('SELECT * FROM project_members WHERE projectId = ? AND userId = ?');
    if (!memberStmt.get(task.projectId, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Update task
router.put('/:taskId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status, description, priority, assignedTo, dueDate } = req.body;
    const userId = req.user?.userId;

    const taskStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = taskStmt.get(taskId) as any;

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user permissions
    const memberStmt = db.prepare('SELECT * FROM project_members WHERE projectId = ? AND userId = ?');
    const member = memberStmt.get(task.projectId, userId) as any;

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Members can only update assigned tasks
    if (member.role === 'Member' && task.assignedTo !== userId) {
      return res.status(403).json({ error: 'Can only update assigned tasks' });
    }

    const now = new Date().toISOString();
    const updateStmt = db.prepare(`
      UPDATE tasks 
      SET status = ?, description = ?, priority = ?, assignedTo = ?, dueDate = ?, updatedAt = ?
      WHERE id = ?
    `);
    updateStmt.run(
      status !== undefined ? status : task.status,
      description !== undefined ? description : task.description,
      priority !== undefined ? priority : task.priority,
      assignedTo !== undefined ? assignedTo : task.assignedTo,
      dueDate !== undefined ? dueDate : task.dueDate,
      now,
      taskId
    );

    const updated = taskStmt.get(taskId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:taskId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.userId;

    const taskStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = taskStmt.get(taskId) as any;

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user is admin
    const adminStmt = db.prepare(
      'SELECT * FROM project_members WHERE projectId = ? AND userId = ? AND role = ?'
    );
    if (!adminStmt.get(task.projectId, userId, 'Admin')) {
      return res.status(403).json({ error: 'Only admins can delete tasks' });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    deleteStmt.run(taskId);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
