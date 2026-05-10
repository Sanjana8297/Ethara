import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api';
import { Project } from '../types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function AssignedProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectAPI.list();
      setProjects(res.data || []);
    } catch (err: any) {
      setError(getErrorMessage(err.response?.data, 'Failed to load projects'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Assigned Projects</h1>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {projects.length === 0 ? (
        <div>No assigned projects.</div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {projects.map((p) => (
            <div key={p.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{p.description}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => navigate(`/projects/${p.id}`)} style={{ padding: '8px 12px', backgroundColor: '#0f62fe', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
