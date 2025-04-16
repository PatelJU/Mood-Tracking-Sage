import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user for development
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    points: 50,
    badges: [
      {
        id: '1',
        name: 'First Mood',
        description: 'Logged your first mood',
        imageUrl: '/badges/first-mood.png',
        earnedAt: new Date().toISOString(),
        criteria: 'Log your first mood',
        points: 50,
        tier: 'bronze'
      },
    ],
    settings: {
      theme: 'light',
      enableWeatherTracking: true,
      enablePredictions: true,
      location: {
        city: 'New York',
        country: 'USA',
        lat: 40.7128,
        lon: -74.0060,
      },
    },
  };

  useEffect(() => {
    // Simulate loading user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      // Use mock user for development
      setCurrentUser(mockUser);
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      setCurrentUser(mockUser);
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      setError(null);
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      const newUser: User = {
        ...mockUser,
        username,
        email,
      };
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setError(null);
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setError(null);
    } catch (err) {
      setError('Failed to logout. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      setError(null);
      // Just simulate the process in this mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 