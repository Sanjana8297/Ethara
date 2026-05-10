import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'ethara.db');

// Ensure data directory exists
mkdirSync(dbDir, { recursive: true });

let sqlDb: SqlJsDatabase | null = null;
let SQL: any = null;
let dbReady = false;

export async function initializeDb() {
  SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const data = readFileSync(dbPath);
    sqlDb = new SQL.Database(data);
  } else {
    sqlDb = new SQL.Database();
  }

  createTables();
  saveDb();
  dbReady = true;
}

function createTables() {
  if (!sqlDb) return;

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      adminId TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS project_members (
      projectId TEXT NOT NULL,
      userId TEXT NOT NULL,
      role TEXT NOT NULL,
      joinedAt TEXT NOT NULL,
      PRIMARY KEY (projectId, userId),
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      assignedTo TEXT,
      dueDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
    )`
  ];

  for (const table of tables) {
    try {
      sqlDb.run(table);
    } catch (err: any) {
      // Table might already exist
    }
  }

  // Ensure project_files table exists
  try {
    sqlDb.run(`CREATE TABLE IF NOT EXISTS project_files (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      filename TEXT NOT NULL,
      description TEXT,
      path TEXT NOT NULL,
      uploadedBy TEXT NOT NULL,
      uploadedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE SET NULL
    )`);
  } catch (err) {}

  // Add status column to projects if missing
  try {
    sqlDb.run('ALTER TABLE projects ADD COLUMN status TEXT');
  } catch (err) {
    // ignore if column exists or alter not supported
  }

  // Add description column to project_files if missing
  try {
    sqlDb.run('ALTER TABLE project_files ADD COLUMN description TEXT');
  } catch (err) {
    // ignore if column exists or alter not supported
  }
}

function saveDb() {
  if (sqlDb) {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export const db = {
  prepare: (sql: string) => {
    if (!sqlDb) throw new Error('Database not initialized');
    return {
      run: (...params: any[]) => {
        try {
          const stmt = sqlDb!.prepare(sql);
          stmt.bind(params);
          stmt.step();
          stmt.free();
          saveDb();
        } catch (err) {
          throw err;
        }
      },
      get: (...params: any[]) => {
        try {
          const stmt = sqlDb!.prepare(sql);
          stmt.bind(params);
          const result = stmt.step() ? stmt.getAsObject() : undefined;
          stmt.free();
          return result;
        } catch (err) {
          throw err;
        }
      },
      all: (...params: any[]) => {
        try {
          const stmt = sqlDb!.prepare(sql);
          stmt.bind(params);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (err) {
          throw err;
        }
      },
    };
  },

  exec: (sql: string) => {
    if (!sqlDb) throw new Error('Database not initialized');
    try {
      sqlDb.run(sql);
      saveDb();
    } catch (err) {
      throw err;
    }
  },

  pragma: (pragma: string) => {
    if (!sqlDb) throw new Error('Database not initialized');
    sqlDb.run(`PRAGMA ${pragma}`);
  },
};

export function initializeDatabase() {
  console.log('Database initialized successfully');
}
