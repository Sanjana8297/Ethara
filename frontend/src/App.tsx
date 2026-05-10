import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AssignedProjectsPage from './pages/AssignedProjectsPage';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Ethara</div>
      {user && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>Welcome, {user.name}</span>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>Dashboard</Link>
          <Link to="/projects" style={{ textDecoration: 'none', color: '#007bff' }}>Projects</Link>
          <Link to="/assigned" style={{ textDecoration: 'none', color: '#007bff' }}>Assigned Projects</Link>
          <button
            onClick={logout}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assigned"
          element={
            <ProtectedRoute>
              <AssignedProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
