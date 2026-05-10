import { Router, Response } from 'express';
import { db } from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// List users. Optional query: excludeProjectId to omit users already in a project
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const excludeProjectId = req.query.excludeProjectId as string | undefined;

    if (excludeProjectId) {
      const stmt = db.prepare(`
        SELECT id, name, email FROM users
        WHERE id NOT IN (SELECT userId FROM project_members WHERE projectId = ?)
      `);
      const users = stmt.all(excludeProjectId);
      return res.json(users);
    }

    const stmt = db.prepare('SELECT id, name, email FROM users');
    const users = stmt.all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
