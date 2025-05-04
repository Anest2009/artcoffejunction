import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInitialAdminUser, supabase } from '../lib/supabase';
import './SetupPage.css';

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Check if users already exist
  useEffect(() => {
    const checkUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        setHasUsers(data && data.length > 0);
      } catch (err) {
        console.error('Error checking users:', err);
        setError(err instanceof Error ? err.message : 'Failed to check if users exist');
      } finally {
        setLoading(false);
      }
    };
    
    checkUsers();
  }, []);
  
  // Create the initial admin user
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await createInitialAdminUser(
        email,
        password,
        name
      );
      
      if (!result.success) {
        throw new Error(result.error instanceof Error ? result.error.message : 'Admin creation failed');
      }
      
      setSuccess(`Admin user ${name} created successfully! Redirecting to login...`);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error creating admin:', err);
      setError(err instanceof Error ? err.message : 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };
  
  // If we're still checking if users exist
  if (hasUsers === null) {
    return (
      <div className="setup-container">
        <div className="card setup-card loading">
          <div className="loading-spinner"></div>
          <p>Checking database status...</p>
        </div>
      </div>
    );
  }
  
  // If users already exist, show a message and redirect to login
  if (hasUsers) {
    return (
      <div className="setup-container">
        <div className="card setup-card">
          <div className="info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1>Setup Already Completed</h1>
          <p>The system has already been set up with at least one user.</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Show the setup form if no users exist
  return (
    <div className="setup-container">
      <div className="card setup-card">
        <h1>Café Staff Dashboard Setup</h1>
        <p className="setup-description">
          Create your initial administrator account to get started with the café staff dashboard.
        </p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}
        
        <form onSubmit={handleCreateAdmin}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="John Doe"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="admin@example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              placeholder="Minimum 6 characters"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary submit-button"
            disabled={loading}
          >
            {loading ? 'Creating Admin...' : 'Create Admin & Start Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPage;
