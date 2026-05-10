import { useEffect, useState } from 'react';
import { dashboardAPI } from '../api';
import { DashboardStats } from '../types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      } catch (err: any) {
        setError(getErrorMessage(err.response?.data, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="dashboard-page">
      <style>{`
        .dashboard-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-title {
          margin: 0 0 20px;
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          line-height: 1.1;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          align-items: stretch;
        }

        .dashboard-card {
          border: 1px solid #ddd;
          padding: clamp(16px, 3vw, 24px);
          border-radius: 12px;
          min-width: 0;
          box-sizing: border-box;
          background: #fff;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          will-change: transform;
        }

        .dashboard-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
          border-color: #cfd8e3;
        }

        @media (hover: none) {
          .dashboard-card:hover {
            transform: none;
            box-shadow: none;
            border-color: #ddd;
          }
        }

        .dashboard-card h3 {
          margin: 0;
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          line-height: 1.3;
          word-break: break-word;
        }

        .dashboard-card p {
          font-size: clamp(1.5rem, 4vw, 2.1rem);
          margin: 10px 0 0;
          line-height: 1;
        }

        .dashboard-status-list {
          margin-top: 30px;
        }

        .dashboard-status-row {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          max-width: 420px;
          flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .dashboard-page {
            padding: 16px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .dashboard-card {
            padding: 16px;
          }
        }
      `}</style>

      <h1 className="dashboard-title">Dashboard</h1>
      {stats && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Total Projects</h3>
            <p>{stats.totalProjects}</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Tasks</h3>
            <p>{stats.totalTasks}</p>
          </div>
          <div className="dashboard-card">
            <h3>Assigned to Me</h3>
            <p>{stats.assignedTasks}</p>
          </div>
          <div className="dashboard-card">
            <h3>Overdue Tasks</h3>
            <p style={{ color: '#dc3545' }}>{stats.overdueTasks}</p>
          </div>
        </div>
      )}
      <div className="dashboard-status-list">
        <h3>Tasks by Status</h3>
        {stats && Object.entries(stats.tasksByStatus).map(([status, count]) => (
          <div key={status} className="dashboard-status-row">
            <strong>{status}:</strong> {count}
          </div>
        ))}
      </div>
    </div>
  );
}
