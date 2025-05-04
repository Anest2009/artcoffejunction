import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import './UnauthorizedPage.css';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="unauthorized-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card unauthorized-card"
      >
        <div className="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1>Access Denied</h1>
        <p className="error-message">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="button-group">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-outline"
          >
            Go Back
          </button>
          <button 
            onClick={handleLogout}
            className="btn btn-primary"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
