import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme, PaletteOptions } from '@mui/material/styles';

interface MoodColors {
  [key: string]: string;
}

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activeColor: string;
  activeTheme: string;
  selectTheme: (themeName: string) => void;
  setMoodColor: (mood: keyof MoodColors) => void;
  moodColors: MoodColors;
  saveCustomTheme: (theme: CustomThemeOptions) => void;
  customThemes: CustomTheme[];
  deleteTheme: (themeId: string) => void;
  currentTheme: string;
  changeTheme: (themeId: string) => void;
  getContrastTextColor: (backgroundColor: string) => boolean;
  getThemeById: (themeId: string) => CustomTheme | undefined;
  availableThemes: string[];
}

// Define the CustomTheme interface
export interface CustomTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  paper: string;
  text: string;
  createdAt?: string;
}

export interface CustomThemeOptions {
  themeName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  paperColor: string;
  textColor: string;
}

const defaultTheme: CustomThemeOptions = {
  themeName: 'Default',
  primaryColor: '#3f51b5',
  secondaryColor: '#f50057',
  backgroundColor: '#f5f5f5',
  paperColor: '#ffffff',
  textColor: '#333333',
};

const darkTheme: CustomThemeOptions = {
  themeName: 'Dark Mode',
  primaryColor: '#7986cb',
  secondaryColor: '#ff4081',
  backgroundColor: '#303030',
  paperColor: '#424242',
  textColor: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultMoodColors: MoodColors = {
  veryGood: '#4CAF50',
  good: '#8BC34A',
  neutral: '#FFC107',
  bad: '#FF9800',
  veryBad: '#F44336',
  default: '#3f51b5',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(() => {
    const storedThemes = localStorage.getItem('customThemes');
    return storedThemes ? JSON.parse(storedThemes) : [];
  });

  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('currentTheme');
    return savedTheme || 'light';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme) {
      const theme = savedTheme;
      const isCustomTheme = customThemes.find(t => t.id === theme);
      if (isCustomTheme) {
        // For custom themes, determine if it's dark based on background color
        const backgroundColor = isCustomTheme.background;
        return isColorDark(backgroundColor);
      }
      // For built-in themes
      return theme === 'dark' || theme === 'navy' || theme === 'forest';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Helper function to determine if a color is dark
  const isColorDark = (color: string): boolean => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate perceived brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return true if dark
    return brightness < 128;
  };

  const [activeColor, setActiveColor] = useState(defaultMoodColors.default);
  const [activeTheme, setActiveTheme] = useState('Default');
  const [savedThemes, setSavedThemes] = useState<CustomThemeOptions[]>([defaultTheme]);
  
  // Load themes and preferences from localStorage on initial render
  useEffect(() => {
    const storedThemes = localStorage.getItem('savedThemes');
    if (storedThemes) {
      setSavedThemes(JSON.parse(storedThemes));
    }
    
    const storedThemeName = localStorage.getItem('activeTheme');
    if (storedThemeName) {
      setActiveTheme(storedThemeName);
    }
    
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode) {
      setIsDarkMode(storedMode === 'true');
    }
  }, []);
  
  // Save themes and preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('savedThemes', JSON.stringify(savedThemes));
  }, [savedThemes]);
  
  useEffect(() => {
    localStorage.setItem('activeTheme', activeTheme);
  }, [activeTheme]);
  
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('customThemes', JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    localStorage.setItem('currentTheme', currentTheme);
  }, [currentTheme]);

  const getActiveThemeOptions = (): CustomThemeOptions => {
    if (isDarkMode) return darkTheme;
    
    const activeThemeObj = savedThemes.find(theme => theme.themeName === activeTheme);
    return activeThemeObj || defaultTheme;
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const createCustomTheme = (themeOptions: CustomThemeOptions) => {
    const existingIndex = savedThemes.findIndex(
      theme => theme.themeName === themeOptions.themeName
    );
    
    if (existingIndex >= 0) {
      const updatedThemes = [...savedThemes];
      updatedThemes[existingIndex] = themeOptions;
      setSavedThemes(updatedThemes);
    } else {
      setSavedThemes(prev => [...prev, themeOptions]);
    }
    
    setActiveTheme(themeOptions.themeName);
  };

  const deleteTheme = (themeName: string) => {
    if (themeName === 'Default') return; // Prevent deletion of default theme
    
    setSavedThemes(prev => prev.filter(theme => theme.themeName !== themeName));
    
    if (activeTheme === themeName) {
      setActiveTheme('Default');
    }
  };

  const theme = useMemo(() => {
    const themeOptions = getActiveThemeOptions();
    
    const palette: PaletteOptions = {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: themeOptions.primaryColor,
      },
      secondary: {
        main: themeOptions.secondaryColor,
      },
      background: {
        default: themeOptions.backgroundColor,
        paper: themeOptions.paperColor,
      },
      text: {
        primary: themeOptions.textColor,
      },
    };

    return createTheme({
      palette,
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              textTransform: 'none',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    });
  }, [isDarkMode, activeTheme, savedThemes]);

  const setMoodColor = (mood: keyof MoodColors) => {
    setActiveColor(defaultMoodColors[mood]);
  };

  const value = {
    theme,
    isDarkMode,
    toggleDarkMode,
    activeColor,
    activeTheme,
    selectTheme: setActiveTheme,
    setMoodColor,
    moodColors: defaultMoodColors,
    saveCustomTheme: createCustomTheme,
    customThemes,
    deleteTheme,
    currentTheme,
    changeTheme: setCurrentTheme,
    getContrastTextColor: isColorDark,
    getThemeById: (themeId: string) => customThemes.find(theme => theme.id === themeId),
    availableThemes: ['light', 'dark', 'forest', 'navy', 'lavender'],
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useDarkMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a ThemeProvider');
  }
  return context;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Add an alias for useTheme to make imports clearer
export const useThemeContext = useTheme; 