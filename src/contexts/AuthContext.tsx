import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getUserRole } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  role?: string;
  counter_type?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to get current user
export const useCurrentUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within an AuthProvider');
  }
  return context.user;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkSession();
      } else {
        setUser(null);
      }
    });
  }, []);

  const checkSession = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        const roleData = await getUserRole(user.id);
        setUser({
          id: user.id,
          email: user.email || '',
          role: roleData?.role,
          counter_type: roleData?.counter_type,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (user) {
        const roleData = await getUserRole(user.id);
        setUser({
          id: user.id,
          email: user.email || '',
          role: roleData?.role,
          counter_type: roleData?.counter_type,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
