import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskAPI, projectAPI, usersAPI } from '../api';
import { Task, ProjectMember } from '../types';
import { useAuth } from '../AuthContext';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Member');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [contentDraft, setContentDraft] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [projectStatusSelection, setProjectStatusSelection] = useState('Active');
  const [projectCustomStatus, setProjectCustomStatus] = useState('');
  const [taskStatusDrafts, setTaskStatusDrafts] = useState<Record<string, string>>({});
  const [taskCustomStatusDrafts, setTaskCustomStatusDrafts] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignedTo: '',
  });

  useEffect(() => {
    if (projectId) {
      fetchData();
      fetchAvailableUsers();
    }
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [tasksRes, membersRes, projectRes] = await Promise.all([
        taskAPI.getByProject(projectId!),
        projectAPI.getMembers(projectId!),
        projectAPI.get(projectId!),
      ]);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
      setContentDraft(projectRes.data?.description || '');

      const standardProjectStatuses = ['Active', 'On Hold', 'Completed'];
      const currentProjectStatus = projectRes.data?.status || 'Active';
      if (standardProjectStatuses.includes(currentProjectStatus)) {
        setProjectStatusSelection(currentProjectStatus);
        setProjectCustomStatus('');
      } else {
        setProjectStatusSelection('Others');
        setProjectCustomStatus(currentProjectStatus);
      }

      const standardTaskStatuses = ['To Do', 'In Progress', 'Done'];
      const nextTaskStatusDrafts: Record<string, string> = {};
      const nextTaskCustomStatusDrafts: Record<string, string> = {};
      (tasksRes.data || []).forEach((task: Task) => {
        if (standardTaskStatuses.includes(task.status)) {
          nextTaskStatusDrafts[task.id] = task.status;
          nextTaskCustomStatusDrafts[task.id] = '';
        } else {
          nextTaskStatusDrafts[task.id] = 'Others';
          nextTaskCustomStatusDrafts[task.id] = task.status || '';
        }
      });
      setTaskStatusDrafts(nextTaskStatusDrafts);
      setTaskCustomStatusDrafts(nextTaskCustomStatusDrafts);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await usersAPI.list(projectId);
      setAvailableUsers(res.data || []);
    } catch (err: any) {
      // silently ignore or show error
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskAPI.create(
        projectId!,
        formData.title,
        formData.description,
        formData.priority,
        formData.dueDate,
        formData.assignedTo
      );
      setFormData({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
      setShowTaskForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleSaveAllChanges = async () => {
    if (!projectId) return;
    setError('');

    const projectStatusValue =
      projectStatusSelection === 'Others' ? projectCustomStatus.trim() : projectStatusSelection;
    if (!projectStatusValue) {
      setError('Please enter a custom project status');
      return;
    }

    const editableTasks = tasks.filter((task) => isAdmin || task.assignedTo === user?.id);
    for (const task of editableTasks) {
      const selected = taskStatusDrafts[task.id] || task.status;
      const finalStatus =
        selected === 'Others' ? (taskCustomStatusDrafts[task.id] || '').trim() : selected;
      if (!finalStatus) {
        setError(`Please enter a custom status for task "${task.title}"`);
        return;
      }
    }

    setIsSavingAll(true);
    try {
      if (isMember) {
        await projectAPI.updateContent(projectId, contentDraft);
        await projectAPI.updateStatus(projectId, projectStatusValue);
      }

      for (const task of editableTasks) {
        const selected = taskStatusDrafts[task.id] || task.status;
        const finalStatus =
          selected === 'Others' ? (taskCustomStatusDrafts[task.id] || '').trim() : selected;
        if (finalStatus !== task.status) {
          await taskAPI.update(task.id, { status: finalStatus });
        }
      }

      if (isMember && selectedFile) {
        await projectAPI.uploadFile(projectId, selectedFile, fileDescription);
        setSelectedFile(null);
        setFileDescription('');
      }

      setSuccessMessage('All changes saved successfully');
      await fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save all changes');
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleDiscardChanges = async () => {
    try {
      setError('');
      setSuccessMessage('');
      setSelectedFile(null);
      setFileDescription('');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to discard changes');
    }
  };

  const isAdmin = members.some((m) => m.id === user?.id && m.role === 'Admin');
  const isMember = members.some((m) => m.id === user?.id);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate('/projects')} style={{ marginBottom: '15px' }}>
        ← Back to Projects
      </button>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div>
          <h1>Tasks</h1>
          {isAdmin && (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {showTaskForm ? 'Cancel' : 'Create Task'}
            </button>
          )}

          {showTaskForm && isAdmin && (
            <form onSubmit={handleCreateTask} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '4px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label>Title:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Priority:</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Assign To:</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Create
              </button>
            </form>
          )}

          <div>
            {/* Project status and file upload for members */}
            <div style={{ marginBottom: '15px', border: '1px solid #eee', padding: '10px', borderRadius: '6px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label>Project Content / Description:</label>
                <textarea
                  value={contentDraft}
                  onChange={(e) => setContentDraft(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                {isMember && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    Content will be saved when you click Save All Changes.
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Project Status:</label>
                <select
                  value={projectStatusSelection}
                  onChange={(e) => setProjectStatusSelection(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Others">Others</option>
                </select>
                {projectStatusSelection === 'Others' && (
                  <input
                    type="text"
                    value={projectCustomStatus}
                    onChange={(e) => setProjectCustomStatus(e.target.value)}
                    placeholder="Enter custom project status"
                    style={{ width: '100%', marginTop: '8px', padding: '8px' }}
                  />
                )}
                {isMember && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    Status will be saved when you click Save All Changes.
                  </div>
                )}
              </div>
              {isMember && (
                <div>
                  <label>Upload File:</label>
                  <input
                    type="text"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="File description (optional)"
                    style={{ width: '100%', marginTop: '8px', padding: '8px' }}
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      setSelectedFile(file);
                    }}
                    style={{ width: '100%', marginTop: '8px' }}
                  />
                  {selectedFile && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Selected file: {selectedFile.name} (will upload on Save All Changes)
                    </div>
                  )}
                </div>
              )}
            </div>
            {tasks.map((task) => (
              <div key={task.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Status:</strong>
                  {isAdmin || task.assignedTo === user?.id ? (
                    <div style={{ marginTop: '8px' }}>
                      <select
                        value={taskStatusDrafts[task.id] || 'To Do'}
                        onChange={(e) => setTaskStatusDrafts((prev) => ({ ...prev, [task.id]: e.target.value }))}
                        style={{ marginLeft: '10px' }}
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                        <option>Others</option>
                      </select>
                      {taskStatusDrafts[task.id] === 'Others' && (
                        <input
                          type="text"
                          value={taskCustomStatusDrafts[task.id] || ''}
                          onChange={(e) => setTaskCustomStatusDrafts((prev) => ({ ...prev, [task.id]: e.target.value }))}
                          placeholder="Enter custom task status"
                          style={{ display: 'block', marginTop: '8px', marginLeft: '10px', width: 'calc(100% - 10px)', padding: '8px' }}
                        />
                      )}
                      <div style={{ marginTop: '8px', marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                        Task status will be saved when you click Save All Changes.
                      </div>
                    </div>
                  ) : (
                    <span style={{ marginLeft: '10px' }}>{task.status}</span>
                  )}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Priority:</strong> <span style={{ marginLeft: '10px', color: task.priority === 'High' ? 'red' : task.priority === 'Low' ? 'green' : 'orange' }}>{task.priority}</span>
                </div>
                {task.dueDate && <div><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
          <h3>Team Members</h3>
          {isAdmin && (
            <div style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <h4>Add Member</h4>
              {successMessage && <div style={{ color: 'green', marginBottom: '10px' }}>{successMessage}</div>}
              <div style={{ marginBottom: '10px' }}>
                <label>User:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Select a user</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Role:</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                  <option>Member</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <button
                  onClick={async () => {
                    if (!selectedUserId) return setError('Please select a user');
                    try {
                      await projectAPI.addMember(projectId!, selectedUserId, selectedRole);
                      setSuccessMessage('User added to project successfully');
                      setSelectedUserId('');
                      fetchData();
                      fetchAvailableUsers();
                      setTimeout(() => setSuccessMessage(''), 3000);
                    } catch (err: any) {
                      setError(err.response?.data?.error || 'Failed to add member');
                    }
                  }}
                  style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
          <div>
            {members.map((member) => (
              <div key={member.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <div><strong>{member.name}</strong></div>
                <div style={{ fontSize: '12px', color: '#666' }}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={handleDiscardChanges}
          disabled={isSavingAll}
          style={{ padding: '10px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: isSavingAll ? 'not-allowed' : 'pointer' }}
        >
          Discard Changes
        </button>
        <button
          onClick={handleSaveAllChanges}
          disabled={isSavingAll}
          style={{ padding: '10px 16px', backgroundColor: isSavingAll ? '#6c757d' : '#0d6efd', color: 'white', border: 'none', borderRadius: '6px', cursor: isSavingAll ? 'not-allowed' : 'pointer' }}
        >
          {isSavingAll ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
