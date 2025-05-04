import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createUser, supabase } from '../../lib/supabase';
import { User } from '../../types';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [counterType, setCounterType] = useState<string>('coffee');
  
  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await createUser(
        email,
        password,
        name,
        role,
        counterType
      );
      
      if (!result.success) {
        throw new Error(result.error instanceof Error ? result.error.message : 'User creation failed');
      }
      
      setSuccess(`User ${name} created successfully!`);
      fetchUsers(); // Refresh the user list
      
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setRole('staff');
      setCounterType('coffee');
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Only admin users should access this page
  if (user?.role !== 'admin') {
    return (
      <div className="unauthorized-container">
        <div className="card unauthorized-card">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1>Access Denied</h1>
          <p className="error-message">
            Only administrators can access the user management page.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="user-management-container">
      <div className="user-management-content">
        <header className="page-header">
          <h1>User Management</h1>
          <p>Add and manage staff accounts</p>
        </header>
        
        <div className="user-management-grid">
          {/* Add User Form */}
          <div className="card add-user-card">
            <h2>Add New Staff</h2>
            
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
            
            <form onSubmit={handleCreateUser}>
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
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="counterType">Counter Type</label>
                <select
                  id="counterType"
                  className="input"
                  value={counterType}
                  onChange={(e) => setCounterType(e.target.value)}
                  disabled={loading || role === 'admin'}
                >
                  <option value="coffee">Coffee Counter</option>
                  <option value="pastry">Pastry Counter</option>
                  <option value="bar">Bar Counter</option>
                </select>
                <small className="help-text">
                  Staff will only see orders for products from their assigned counter category.
                </small>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary submit-button"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
          
          {/* User List */}
          <div className="card user-list-card">
            <h2>Staff Members</h2>
            
            {loading && <p className="loading-text">Loading users...</p>}
            
            {!loading && users.length === 0 && (
              <p className="no-data-message">No users found.</p>
            )}
            
            {!loading && users.length > 0 && (
              <div className="user-list">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Counter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.counter_type || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
