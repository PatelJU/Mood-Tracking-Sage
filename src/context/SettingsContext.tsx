import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define settings interface
interface Settings {
  theme: 'light' | 'dark' | 'system';
  reduceAnimations: boolean;
  enableNotifications: boolean;
  enableWeatherTracking: boolean;
  useHighContrastMode: boolean;
}

// Define context type
interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  toggleReduceAnimations: () => void;
}

// Create the context with a default value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Default settings
const defaultSettings: Settings = {
  theme: 'system',
  reduceAnimations: false,
  enableNotifications: true,
  enableWeatherTracking: true,
  useHighContrastMode: false,
};

// Provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // Update settings function
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Convenience function for toggling reduce animations
  const toggleReduceAnimations = () => {
    setSettings(prevSettings => ({
      ...prevSettings,
      reduceAnimations: !prevSettings.reduceAnimations,
    }));
  };

  // Context value
  const value = {
    settings,
    updateSettings,
    toggleReduceAnimations,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider; 