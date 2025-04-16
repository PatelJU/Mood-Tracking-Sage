import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeType, CustomTheme, MoodType } from '../types';
import { themePalettes } from '../components/themes/themePalettes';

// Helper function to normalize mood types
export const normalizeMoodType = (mood: string): MoodType => {
  // Convert from camelCase to MoodType format
  if (mood === 'veryBad') return 'Very Bad';
  if (mood === 'bad') return 'Bad';
  if (mood === 'neutral') return 'Okay';
  if (mood === 'good') return 'Good';
  if (mood === 'veryGood') return 'Very Good';

  // Check if it's already a valid MoodType
  if (['Very Bad', 'Bad', 'Okay', 'Good', 'Very Good'].includes(mood as MoodType)) {
    return mood as MoodType;
  }
  
  // Default to Okay if not recognized
  return 'Okay';
};

interface ThemeContextType {
  currentTheme: ThemeType | string;
  setTheme: (theme: ThemeType | string) => void;
  availableThemes: ThemeType[];
  moodColors: {
    'Very Bad': string;
    'Bad': string;
    'Okay': string;
    'Good': string;
    'Very Good': string;
  };
  customThemes: CustomTheme[];
  addCustomTheme: (theme: CustomTheme) => void;
  deleteCustomTheme: (themeId: string) => void;
  activeCustomTheme: CustomTheme | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const availableThemes: ThemeType[] = ['light', 'dark', 'ocean', 'sunset', 'forest', 'pastel'];
  const [currentTheme, setCurrentTheme] = useState<ThemeType | string>('light');
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [activeCustomTheme, setActiveCustomTheme] = useState<CustomTheme | null>(null);

  // Define the mood colors (these could change based on theme)
  const moodColors = {
    'Very Bad': "#d32f2f", // Red
    'Bad': "#f57c00",      // Orange
    'Okay': "#ffd600",     // Yellow
    'Good': "#4caf50",     // Green
    'Very Good': "#2196f3", // Blue
    // Add camelCase versions
    'veryBad': "#d32f2f",
    'bad': "#f57c00",
    'neutral': "#ffd600", 
    'good': "#4caf50",
    'veryGood': "#2196f3"
  };

  useEffect(() => {
    // Load theme from localStorage or use default
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      if (availableThemes.includes(savedTheme as ThemeType)) {
        setCurrentTheme(savedTheme);
        setActiveCustomTheme(null);
      } else {
        // It might be a custom theme ID
        const loadedCustomThemes = loadCustomThemes();
        const customTheme = loadedCustomThemes.find(theme => theme.id === savedTheme);
        if (customTheme) {
          setCurrentTheme(savedTheme);
          setActiveCustomTheme(customTheme);
        } else {
          setCurrentTheme('light');
          setActiveCustomTheme(null);
        }
      }
    }
    
    // Load custom themes
    setCustomThemes(loadCustomThemes());
  }, []);

  // Load custom themes from localStorage
  const loadCustomThemes = (): CustomTheme[] => {
    const savedThemes = localStorage.getItem('customThemes');
    if (savedThemes) {
      try {
        return JSON.parse(savedThemes);
      } catch (error) {
        console.error('Failed to parse custom themes', error);
      }
    }
    return [];
  };

  // Save custom themes to localStorage
  const saveCustomThemes = (themes: CustomTheme[]) => {
    localStorage.setItem('customThemes', JSON.stringify(themes));
  };

  // When theme changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // Create the MUI theme based on the current theme selection
  const muiTheme = activeCustomTheme 
    ? createTheme({
        ...themePalettes.light, // Use base theme options
        palette: {
          ...themePalettes.light.palette,
          primary: {
            main: activeCustomTheme.primary,
            light: activeCustomTheme.primary + '80', // Add transparency for light version
            dark: activeCustomTheme.primary + 'CC',  // Add transparency for dark version
            contrastText: isLightColor(activeCustomTheme.primary) ? '#000000' : '#FFFFFF',
          },
          secondary: {
            main: activeCustomTheme.secondary,
            light: activeCustomTheme.secondary + '80',
            dark: activeCustomTheme.secondary + 'CC',
            contrastText: isLightColor(activeCustomTheme.secondary) ? '#000000' : '#FFFFFF',
          },
          background: {
            default: activeCustomTheme.background,
            paper: activeCustomTheme.paper,
          },
          text: {
            primary: activeCustomTheme.text,
            secondary: activeCustomTheme.text + '99', // Add transparency for secondary text
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: activeCustomTheme.background,
                color: activeCustomTheme.text
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none'
              }
            }
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundImage: 'none',
                backgroundColor: activeCustomTheme.paper
              }
            }
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: activeCustomTheme.paper,
                color: activeCustomTheme.text
              }
            }
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '8px',
                padding: '8px 16px'
              }
            }
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: '12px'
              }
            }
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: `${activeCustomTheme.text}22`
              }
            }
          }
        },
        shape: {
          borderRadius: 8
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 600
          },
          h2: {
            fontWeight: 600
          },
          h3: {
            fontWeight: 600
          },
          h4: {
            fontWeight: 600
          },
          h5: {
            fontWeight: 600
          },
          h6: {
            fontWeight: 600
          },
          subtitle1: {
            fontWeight: 500
          },
          subtitle2: {
            fontWeight: 500
          }
        }
      })
    : createTheme({
        ...(themePalettes[currentTheme as ThemeType] || themePalettes.light),
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: themePalettes[currentTheme as ThemeType]?.palette?.background?.default || '#ffffff',
                color: themePalettes[currentTheme as ThemeType]?.palette?.text?.primary || '#000000'
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none'
              }
            }
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundImage: 'none'
              }
            }
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none'
              }
            }
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '8px',
                padding: '8px 16px'
              }
            }
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: '12px'
              }
            }
          }
        },
        shape: {
          borderRadius: 8
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 600
          },
          h2: {
            fontWeight: 600
          },
          h3: {
            fontWeight: 600
          },
          h4: {
            fontWeight: 600
          },
          h5: {
            fontWeight: 600
          },
          h6: {
            fontWeight: 600
          },
          subtitle1: {
            fontWeight: 500
          },
          subtitle2: {
            fontWeight: 500
          }
        }
      });

  // Helper function to determine if a color is light or dark
  function isLightColor(color: string): boolean {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return true if light, false if dark
    return luminance > 0.5;
  }

  const setTheme = (theme: ThemeType | string) => {
    if (availableThemes.includes(theme as ThemeType)) {
      setCurrentTheme(theme);
      setActiveCustomTheme(null);
    } else {
      // Check if it's a custom theme
      const customTheme = customThemes.find(t => t.id === theme);
      if (customTheme) {
        setCurrentTheme(theme);
        setActiveCustomTheme(customTheme);
      }
    }
  };

  const addCustomTheme = (theme: CustomTheme) => {
    // Check if the theme exists already
    const existingIndex = customThemes.findIndex(t => t.id === theme.id);
    
    let updatedThemes: CustomTheme[];
    
    if (existingIndex >= 0) {
      // Update existing theme
      updatedThemes = [...customThemes];
      updatedThemes[existingIndex] = theme;
    } else {
      // Add new theme
      updatedThemes = [...customThemes, theme];
    }
    
    setCustomThemes(updatedThemes);
    saveCustomThemes(updatedThemes);
    
    // Apply the theme if it's being edited and is currently active
    if (activeCustomTheme && activeCustomTheme.id === theme.id) {
      setActiveCustomTheme(theme);
    }
  };

  const deleteCustomTheme = (themeId: string) => {
    const updatedThemes = customThemes.filter(theme => theme.id !== themeId);
    setCustomThemes(updatedThemes);
    saveCustomThemes(updatedThemes);
    
    // Reset to default theme if the active theme is deleted
    if (activeCustomTheme && activeCustomTheme.id === themeId) {
      setCurrentTheme('light');
      setActiveCustomTheme(null);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes,
    moodColors,
    customThemes,
    addCustomTheme,
    deleteCustomTheme,
    activeCustomTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 