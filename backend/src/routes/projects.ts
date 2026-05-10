import { Response, Router } from 'express';
import path from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

const uploadDir = path.join(__dirname, '../../../data/project_files');
mkdirSync(uploadDir, { recursive: true });

// Create project
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const adminId = req.user?.userId;

    if (!name || !adminId) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const projectId = uuidv4();
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(
      'INSERT INTO projects (id, name, description, adminId, createdAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(projectId, name, description || '', adminId, createdAt);

    // Add admin as project member
    const memberStmt = db.prepare(
      'INSERT INTO project_members (projectId, userId, role, joinedAt) VALUES (?, ?, ?, ?)'
    );
    memberStmt.run(projectId, adminId, 'Admin', createdAt);

    res.status(201).json({ id: projectId, name, description, adminId, createdAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get user's projects
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const stmt = db.prepare(`
      SELECT p.* FROM projects p
      JOIN project_members pm ON p.id = pm.projectId
      WHERE pm.userId = ?
      ORDER BY p.createdAt DESC
    `);
    const projects = stmt.all(userId);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project details
router.get('/:projectId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    // Verify user is a member
    const memberStmt = db.prepare('SELECT * FROM project_members WHERE projectId = ? AND userId = ?');
    if (!memberStmt.get(projectId, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = stmt.get(projectId);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update project status (members can change)
router.put('/:projectId/status', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    // Verify caller is a member
    const memberStmt = db.prepare('SELECT * FROM project_members WHERE projectId = ? AND userId = ?');
    if (!memberStmt.get(projectId, userId)) {
      return res.status(403).json({ error: 'Only project members can update status' });
    }

    const stmt = db.prepare('UPDATE projects SET status = ? WHERE id = ?');
    stmt.run(status, projectId);

    const getStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = getStmt.get(projectId);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Update project content/description (members can change)
router.put('/:projectId/content', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { description } = req.body;
    const userId = req.user?.userId;

    // Verify caller is a member
    const memberStmt = db.prepare('SELECT * FROM project_members WHERE projectId = ? AND userId = ?');
    if (!memberStmt.get(projectId, userId)) {
      return res.status(403).json({ error: 'Only project members can update content' });
    }

    const stmt = db.prepare('UPDATE projects SET description = ? WHERE id = ?');
    stmt.run(description || '', projectId);

    const getStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = getStmt.get(projectId);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project content' });
  }
});

// Upload file to project via JSON base64 payload (members only)
router.post('/:projectId/upload-json', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    // Verify caller is a member
    const memberStmt = db.prepare('SELECT * FROM project_members WHERE projectId = ? AND userId = ?');
    if (!memberStmt.get(projectId, userId)) {
      return res.status(403).json({ error: 'Only project members can upload files' });
    }

    const { filename, contentBase64, description } = req.body;
    if (!filename || !contentBase64) return res.status(400).json({ error: 'filename and contentBase64 are required' });

    const buffer = Buffer.from(contentBase64, 'base64');
    const uniqueName = `${Date.now()}-${filename}`;
    const savePath = path.join(uploadDir, uniqueName);
    writeFileSync(savePath, buffer);

    const fileId = uuidv4();
    const uploadedAt = new Date().toISOString();
    const stmt = db.prepare('INSERT INTO project_files (id, projectId, filename, description, path, uploadedBy, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(fileId, projectId, filename, description || '', savePath, userId, uploadedAt);

    res.status(201).json({ id: fileId, filename, description: description || '', path: savePath, uploadedBy: userId, uploadedAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Add member to project
router.post('/:projectId/members', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;
    const adminId = req.user?.userId;

    // Verify caller is admin
    const adminStmt = db.prepare(
      'SELECT * FROM project_members WHERE projectId = ? AND userId = ? AND role = ?'
    );
    if (!adminStmt.get(projectId, adminId, 'Admin')) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    const joinedAt = new Date().toISOString();
    const stmt = db.prepare(
      'INSERT INTO project_members (projectId, userId, role, joinedAt) VALUES (?, ?, ?, ?)'
    );
    stmt.run(projectId, userId, role || 'Member', joinedAt);

    res.status(201).json({ projectId, userId, role: role || 'Member', joinedAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Get project members
router.get('/:projectId/members', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    // Verify user is a member
    const memberStmt = db.prepare('SELECT * FROM project_members WHERE projectId = ? AND userId = ?');
    if (!memberStmt.get(projectId, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stmt = db.prepare(`
      SELECT u.id, u.name, u.email, pm.role, pm.joinedAt
      FROM project_members pm
      JOIN users u ON pm.userId = u.id
      WHERE pm.projectId = ?
    `);
    const members = stmt.all(projectId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Remove member from project
router.delete('/:projectId/members/:userId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { projectId, userId } = req.params;
    const adminId = req.user?.userId;

    // Verify caller is admin
    const adminStmt = db.prepare(
      'SELECT * FROM project_members WHERE projectId = ? AND userId = ? AND role = ?'
    );
    if (!adminStmt.get(projectId, adminId, 'Admin')) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    const stmt = db.prepare('DELETE FROM project_members WHERE projectId = ? AND userId = ?');
    stmt.run(projectId, userId);

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
