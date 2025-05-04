import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('baker');
  const [counterType, setCounterType] = useState('pastry');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createStaffAccount = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create user in Supabase
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error('User creation failed');
      }

      // 2. Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: user.id,
            role,
            counter_type: counterType,
          }
        ]);

      if (roleError) {
        throw roleError;
      }

      alert('Staff account created successfully!');
      setEmail('');
      setPassword('');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to create staff account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-gold-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brown-500 mb-2">Nature Brew Café</h1>
          <p className="text-gold-500">Create Staff Account</p>
        </div>

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="baker">Baker</option>
            <option value="barista">Barista</option>
            <option value="manager">Manager</option>
          </select>
          <select
            value={counterType}
            onChange={(e) => setCounterType(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="pastry">Pastry Counter</option>
            <option value="coffee">Coffee Counter</option>
            <option value="bar">Bar Counter</option>
          </select>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            variant="primary"
            className="w-full"
            onClick={createStaffAccount}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Staff Account'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
