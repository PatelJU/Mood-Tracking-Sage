import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demo purposes
const mockUser: User = {
  uid: '123456',
  email: 'user@example.com',
  displayName: 'Demo User',
  avatarUrl: '',
  isAdmin: false,
  createdAt: new Date('2023-01-01'),
  lastLogin: new Date(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate auth state change (for demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(mockUser);
      setError(null);
    } catch (err) {
      setError('Failed to sign in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser = { ...mockUser, email, displayName: name };
      setUser(newUser);
      setError(null);
    } catch (err) {
      setError('Failed to create account');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      setError(null);
    } catch (err) {
      setError('Failed to sign out');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError(null);
    } catch (err) {
      setError('Failed to reset password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
      }
      setError(null);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 