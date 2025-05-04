import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, User } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Helper function to check if user has a valid counter type
const hasValidCounterType = (user: User | null): boolean => {
  if (!user?.counter_type) return false;
  return ['baker', 'barista'].includes(user.counter_type);
};

const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user?.role || !hasValidCounterType(user)) {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user?.role || user.role !== 'manager') {
    return <Navigate to="/staff" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/staff" element={
            <ProtectedRoute>
              <StaffRoute>
                <StaffDashboard />
              </StaffRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
