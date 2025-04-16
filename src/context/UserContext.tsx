import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  joined: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  preferences: {
    dailyReminders: boolean;
    achievementAlerts: boolean;
    weeklyInsights: boolean;
    dataSharing: boolean;
  };
  badges: Badge[];
  stats: {
    totalEntries: number;
    streakDays: number;
    moodAverage: number;
    insightsGenerated: number;
  }
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updatePreference: (key: keyof User['preferences'], value: boolean) => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for development
const mockUser: User = {
  id: "user123",
  name: "Demo User",
  email: "demo@example.com",
  joined: "2023-09-15",
  avatarUrl: "",
  bio: "I'm tracking my moods to develop better emotional awareness and practice mindfulness regularly.",
  location: "",
  preferences: {
    dailyReminders: true,
    achievementAlerts: true,
    weeklyInsights: true,
    dataSharing: false
  },
  badges: [
    {
      id: "b1",
      name: "Early Bird",
      description: "Joined during the app's beta phase",
      icon: "star",
      dateEarned: "2023-09-15"
    },
    {
      id: "b2",
      name: "Week Warrior",
      description: "Logged moods for 7 consecutive days",
      icon: "calendar_today",
      dateEarned: "2023-09-22"
    },
    {
      id: "b3",
      name: "Insight Master",
      description: "Generated 10 unique insights",
      icon: "psychology",
      dateEarned: "2023-10-05"
    }
  ],
  stats: {
    totalEntries: 23,
    streakDays: 7,
    moodAverage: 3.7,
    insightsGenerated: 15
  }
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Simulate fetching user data
    const fetchUser = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setUser(mockUser);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        if (user) {
          setUser({ ...user, ...updates });
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error updating user:', error);
      setIsLoading(false);
      throw error;
    }
  };
  
  const updatePreference = async (key: keyof User['preferences'], value: boolean): Promise<void> => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        if (user) {
          setUser({
            ...user,
            preferences: {
              ...user.preferences,
              [key]: value
            }
          });
        }
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error updating preference:', error);
      setIsLoading(false);
      throw error;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      // In a real app, this would be an API call
      setTimeout(() => {
        setUser(null);
      }, 300);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };
  
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      // In a real app, this would validate credentials with the server
      setTimeout(() => {
        setUser(mockUser);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error logging in:', error);
      setIsLoading(false);
      throw error;
    }
  };
  
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      // In a real app, this would register the user on the server
      setTimeout(() => {
        const newUser = { 
          ...mockUser, 
          name, 
          email,
          id: `u${Math.floor(Math.random() * 10000)}`,
          joined: new Date().toISOString().split('T')[0]
        };
        setUser(newUser);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error registering:', error);
      setIsLoading(false);
      throw error;
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    updateUser,
    updatePreference,
    logout,
    login,
    register
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 