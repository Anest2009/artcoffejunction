// App.tsx - Main routing configuration
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OrdersProvider } from './contexts/OrdersContext';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UnauthorizedPage from './pages/UnauthorizedPage';
import SetupPage from './pages/SetupPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <OrdersProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/setup" element={<SetupPage />} />
            
            {/* Protected routes */}
            <Route path="/staff" element={
              <ProtectedRoute requiredCounterType={['coffee', 'pastry', 'bar']}>
                <StaffDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            
            {/* Redirect to login by default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </OrdersProvider>
    </AuthProvider>
  );
}

export default App;
