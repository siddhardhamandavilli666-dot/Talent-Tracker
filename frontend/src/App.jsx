import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './components/routing/RouteGuards';
import Navbar from './components/layout/Navbar';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import StudentProfile from './pages/student/StudentProfile';
import StudentDashboard from './pages/student/StudentDashboard';
import TalentDiscovery from './pages/discovery/TalentDiscovery';
import OpportunityBoard from './pages/opportunities/OpportunityBoard';
import OpportunityDetail from './pages/opportunities/OpportunityDetail';
import OrgDashboard from './pages/organization/OrgDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import './index.css';
import './pages/auth/Auth.css';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1b2e',
              color: '#f0f0ff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00D4AA', secondary: '#0a0b18' } },
            error: { iconTheme: { primary: '#FF5757', secondary: '#0a0b18' } },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/discover" element={<ProtectedRoute><TalentDiscovery /></ProtectedRoute>} />
          <Route path="/opportunities" element={<ProtectedRoute><OpportunityBoard /></ProtectedRoute>} />
          <Route path="/opportunities/:id" element={<ProtectedRoute><OpportunityDetail /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<StudentProfile />} />

          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['student']}>
                  <StudentDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/organization"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['organization']}>
                  <OrgDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="empty-state">
                  <span style={{ fontSize: 64 }}>🔍</span>
                  <h2>404 — Page not found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
