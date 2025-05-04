import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }

      if (authUser) {
        // Fetch user profile data from users table
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        // If user exists in the users table
        if (userData && !profileError) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            role: userData.role || 'staff',
            counter_type: userData.counter_type || null,
            name: userData.name
          });
        } 
        // If user doesn't exist in the users table, create an entry
        else {
          console.log('User not found in users table during session check, creating entry...');
          
          // Create a default user entry
          const newUser = {
            id: authUser.id,
            email: authUser.email || '',
            role: 'staff', // Default role
            counter_type: null,
            name: authUser.user_metadata?.name || 'Staff Member',
            created_at: new Date().toISOString()
          };
          
          const { error: insertError } = await supabase
            .from('users')
            .insert([newUser]);

          if (insertError) {
            console.error('Error creating user entry during session check:', insertError);
            throw insertError;
          }
          
          // Set the user with the newly created data
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking session:', err);
      setError(err instanceof Error ? err.message : 'Session check failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Fetch user data from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // If user doesn't exist in the users table, create it
        if (userError || !userData) {
          console.log('User not found in users table, creating entry...');
          
          // Create user entry
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                role: 'staff', // Default role
                name: data.user.user_metadata?.name || 'Staff Member',
                created_at: new Date().toISOString()
              }
            ]);

          if (insertError) {
            console.error('Error creating user entry:', insertError);
          }
        }

        // Refresh the session data
        await checkSession();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          checkSession();
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// User type is exported from types.ts
