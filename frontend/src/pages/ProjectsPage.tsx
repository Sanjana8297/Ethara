import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, usersAPI } from '../api';
import { Project, ProjectMember } from '../types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedSection, setSelectedSection] = useState<'create' | 'manage'>('create');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [memberFormData, setMemberFormData] = useState({ userId: '', role: 'Member' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.list();
      setProjects(response.data);
      if (!selectedProjectId && response.data.length > 0) {
        setSelectedProjectId(response.data[0].id);
      }
    } catch (err: any) {
      setError(getErrorMessage(err.response?.data, 'Failed to load projects'));
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (projectId: string) => {
    if (!projectId) {
      setMembers([]);
      return;
    }

    setMembersLoading(true);
    try {
      const response = await projectAPI.getMembers(projectId);
      setMembers(response.data);
      fetchAvailableUsers(projectId);
    } catch (err: any) {
      setError(getErrorMessage(err.response?.data, 'Failed to load project members'));
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchAvailableUsers = async (projectId?: string) => {
    if (!projectId) {
      setAvailableUsers([]);
      return;
    }

    try {
      const res = await usersAPI.list(projectId);
      setAvailableUsers(res.data || []);
    } catch (err: any) {
      // ignore
      setAvailableUsers([]);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectAPI.create(formData.name, formData.description);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (err: any) {
      setError(getErrorMessage(err.response?.data, 'Failed to create project'));
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedSection('manage');
    fetchMembers(projectId);
    fetchAvailableUsers(projectId);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    try {
      await projectAPI.addMember(selectedProjectId, memberFormData.userId, memberFormData.role);
      setMemberFormData({ userId: '', role: 'Member' });
      fetchMembers(selectedProjectId);
      fetchAvailableUsers(selectedProjectId);
    } catch (err: any) {
      setError(getErrorMessage(err.response?.data, 'Failed to add member'));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedProjectId) return;
    const ok = window.confirm('Remove this member from the project?');
    if (!ok) return;
    try {
      await projectAPI.removeMember(selectedProjectId, userId);
      setSuccessMessage('Member removed');
      fetchMembers(selectedProjectId);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err.response?.data, 'Failed to remove member'));
    }
  };

  useEffect(() => {
    if (selectedSection === 'manage' && selectedProjectId) {
      fetchMembers(selectedProjectId);
    }
  }, [selectedSection, selectedProjectId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="projects-layout">
      <style>{`
        .projects-layout {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 24px;
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .projects-sidebar {
          position: sticky;
          top: 20px;
          align-self: start;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 16px;
          background: #fff;
        }

        .projects-sidebar h2 {
          margin: 0 0 12px;
          font-size: 1.2rem;
        }

        .projects-sidebar button {
          width: 100%;
          text-align: left;
          border: 1px solid transparent;
          background: #f8fafc;
          color: #111827;
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          margin-bottom: 10px;
        }

        .projects-sidebar button.active {
          background: #0f62fe;
          color: #fff;
        }

        .projects-main {
          min-width: 0;
        }

        .projects-panel {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          background: #fff;
          margin-bottom: 20px;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .project-card {
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          background: #fff;
        }

        .project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
          border-color: #cfd8e3;
        }

        .members-list {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .member-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px 14px;
          flex-wrap: wrap;
        }

        .member-row button {
          width: auto;
          margin: 0;
          background: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 900px) {
          .projects-layout {
            grid-template-columns: 1fr;
          }

          .projects-sidebar {
            position: static;
          }
        }

        @media (max-width: 560px) {
          .projects-layout {
            padding: 16px;
            gap: 16px;
          }

          .projects-panel {
            padding: 16px;
          }

          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <aside className="projects-sidebar">
        <h2>Projects</h2>
        <button
          className={selectedSection === 'create' ? 'active' : ''}
          onClick={() => setSelectedSection('create')}
        >
          Create Project
        </button>
        <button
          className={selectedSection === 'manage' ? 'active' : ''}
          onClick={() => {
            setSelectedSection('manage');
            if (selectedProjectId) {
              fetchMembers(selectedProjectId);
            }
          }}
        >
          Manage Users
        </button>
      </aside>

      <main className="projects-main">
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        {successMessage && <div style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</div>}

        {selectedSection === 'create' && (
          <section className="projects-panel">
            <h1 style={{ marginTop: 0 }}>Create Project</h1>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '15px' }}>
                <label>Project Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '100px' }}
                />
              </div>
              <button
                type="submit"
                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Create
              </button>
            </form>
          </section>
        )}

        {selectedSection === 'manage' && (
          <section className="projects-panel">
            <h1 style={{ marginTop: 0 }}>Manage Users</h1>
            <div style={{ marginBottom: '16px' }}>
              <label>Select Project:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAddMember} style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label>User:</label>
                <select
                  value={memberFormData.userId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, userId: e.target.value })}
                  required
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
              <div style={{ marginBottom: '15px' }}>
                <label>Role:</label>
                <select
                  value={memberFormData.role}
                  onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Add User
              </button>
            </form>

            <div>
              <h3 style={{ marginTop: 0 }}>Current Members</h3>
              {membersLoading ? (
                <div>Loading members...</div>
              ) : members.length === 0 ? (
                <div>No members found for this project.</div>
              ) : (
                <div className="members-list">
                  {members.map((member) => (
                    <div key={member.id} className="member-row">
                      <div>
                        <strong>{member.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>{member.email}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{member.role}</div>
                      </div>
                      {member.role !== 'Admin' && (
                        <button onClick={() => handleRemoveMember(member.id)}>Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="projects-panel">
          <h2 style={{ marginTop: 0 }}>All Projects</h2>
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectSelect(project.id);
                  }}
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#e8f0fe',
                    color: '#0f62fe',
                  }}
                >
                  Manage Users
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
