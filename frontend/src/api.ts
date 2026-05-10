import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (name: string, email: string, password: string) =>
    api.post('/auth/signup', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const projectAPI = {
  create: (name: string, description: string) =>
    api.post('/projects', { name, description }),
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  updateStatus: (projectId: string, status: string) => api.put(`/projects/${projectId}/status`, { status }),
  updateContent: (projectId: string, description: string) => api.put(`/projects/${projectId}/content`, { description }),
  uploadFile: async (projectId: string, file: File, description?: string) => {
    const contentBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    return api.post(`/projects/${projectId}/upload-json`, {
      filename: file.name,
      contentBase64,
      description: description || '',
    });
  },
  addMember: (projectId: string, userId: string, role: string) =>
    api.post(`/projects/${projectId}/members`, { userId, role }),
  getMembers: (projectId: string) => api.get(`/projects/${projectId}/members`),
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
};

export const usersAPI = {
  list: (excludeProjectId?: string) =>
    api.get('/users', { params: excludeProjectId ? { excludeProjectId } : {} }),
};

export const taskAPI = {
  create: (projectId: string, title: string, description: string, priority: string, dueDate?: string, assignedTo?: string) =>
    api.post('/tasks', { projectId, title, description, priority, dueDate, assignedTo }),
  getByProject: (projectId: string) => api.get(`/tasks/project/${projectId}`),
  get: (id: string) => api.get(`/tasks/${id}`),
  update: (id: string, updates: any) => api.put(`/tasks/${id}`, updates),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

export default api;
