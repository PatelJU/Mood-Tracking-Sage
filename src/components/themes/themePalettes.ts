import { ThemeOptions } from '@mui/material/styles';
import { ThemeType } from '../../types';

// Common theme options
const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
};

// Light theme (default)
const lightTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#6200EA',
      light: '#B388FF',
      dark: '#4A148C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#03DAC6',
      light: '#B2DFDB',
      dark: '#00897B',
      contrastText: '#000000',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    error: {
      main: '#B00020',
    },
    warning: {
      main: '#FFC107',
    },
    info: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
  },
};

// Dark theme
const darkTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC',
      light: '#D1C4E9',
      dark: '#7C4DFF',
      contrastText: '#000000',
    },
    secondary: {
      main: '#03DAC6',
      light: '#B2DFDB',
      dark: '#018786',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#ABABAB',
    },
    error: {
      main: '#CF6679',
    },
    warning: {
      main: '#FFAB00',
    },
    info: {
      main: '#64B5F6',
    },
    success: {
      main: '#81C784',
    },
  },
};

// Ocean theme
const oceanTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#006064',
      light: '#4DD0E1',
      dark: '#00363A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1A237E',
      light: '#5C6BC0',
      dark: '#0D1642',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#E0F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#263238',
      secondary: '#546E7A',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#FFA000',
    },
    info: {
      main: '#0288D1',
    },
    success: {
      main: '#388E3C',
    },
  },
};

// Sunset theme
const sunsetTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6F00',
      light: '#FFB74D',
      dark: '#E65100',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#AD1457',
      light: '#F48FB1',
      dark: '#880E4F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFF8E1',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3E2723',
      secondary: '#5D4037',
    },
    error: {
      main: '#C62828',
    },
    warning: {
      main: '#FFA000',
    },
    info: {
      main: '#1976D2',
    },
    success: {
      main: '#2E7D32',
    },
  },
};

// Forest theme
const forestTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32',
      light: '#81C784',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#795548',
      light: '#A1887F',
      dark: '#4E342E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#E8F5E9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    error: {
      main: '#C62828',
    },
    warning: {
      main: '#F57F17',
    },
    info: {
      main: '#1565C0',
    },
    success: {
      main: '#2E7D32',
    },
  },
};

// Pastel theme
const pastelTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#9C27B0',
      light: '#CE93D8',
      dark: '#7B1FA2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#26A69A',
      light: '#80CBC4',
      dark: '#00897B',
      contrastText: '#000000',
    },
    background: {
      default: '#F3E5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4A148C',
      secondary: '#7B1FA2',
    },
    error: {
      main: '#EC407A',
    },
    warning: {
      main: '#FFA726',
    },
    info: {
      main: '#42A5F5',
    },
    success: {
      main: '#66BB6A',
    },
  },
};

// Export all themes in a map
export const themePalettes: Record<ThemeType, ThemeOptions> = {
  light: lightTheme,
  dark: darkTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  forest: forestTheme,
  pastel: pastelTheme,
}; 