import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LogoutPage.css';

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Clear any local storage items that might be persisting the session
        localStorage.removeItem('supabase.auth.token');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (error) {
        console.error('Error during logout:', error);
        // Redirect to login page even if there's an error
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="logout-container">
      <div className="logout-card">
        <div className="logout-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <h1>Signing Out</h1>
        <p>You are being logged out of the café staff dashboard...</p>
        <div className="logout-spinner"></div>
      </div>
    </div>
  );
};

export default LogoutPage;
