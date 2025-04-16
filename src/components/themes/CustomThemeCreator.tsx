import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme as useMuiTheme,
  Snackbar,
  Alert,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  Chip,
  Menu,
  MenuItem,
  Popover,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ChromePicker } from 'react-color';
import { v4 as uuidv4 } from 'uuid';
import { CustomTheme } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import PreviewIcon from '@mui/icons-material/Preview';
import UndoIcon from '@mui/icons-material/Undo';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FormatColorResetIcon from '@mui/icons-material/FormatColorReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme as useThemeContext } from '../../context/ThemeContext';

// Color utility functions
const colorUtils = {
  // Determine if a color is light or dark
  isLightColor: (color: string): boolean => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  },
  
  // Generate complementary color
  getComplementaryColor: (hex: string): string => {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Invert the colors
    const rComp = 255 - r;
    const gComp = 255 - g;
    const bComp = 255 - b;
    
    // Convert back to hex
    return `#${rComp.toString(16).padStart(2, '0')}${gComp.toString(16).padStart(2, '0')}${bComp.toString(16).padStart(2, '0')}`;
  },
  
  // Generate analogous colors
  getAnalogousColors: (hex: string): string[] => {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Convert to HSL
    const hsl = colorUtils.rgbToHsl(r, g, b);
    const h = hsl[0], s = hsl[1], l = hsl[2];
    
    // Generate analogous colors (30 degrees in both directions)
    const color1 = colorUtils.hslToHex((h + 30) % 360, s, l);
    const color2 = colorUtils.hslToHex((h + 330) % 360, s, l); // Same as (h - 30 + 360) % 360
    
    return [color1, color2];
  },
  
  // RGB to HSL conversion
  rgbToHsl: (r: number, g: number, b: number): number[] => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h *= 60;
    }
    
    return [Math.round(h), s, l];
  },
  
  // HSL to hex conversion
  hslToHex: (h: number, s: number, l: number): string => {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hueToRgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hueToRgb(p, q, (h / 360) + 1/3);
      g = hueToRgb(p, q, h / 360);
      b = hueToRgb(p, q, (h / 360) - 1/3);
    }
    
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },
  
  // Create an array of preset color palettes based on color theory
  getPresetPalettes: (): {name: string; colors: {primary: string; secondary: string; background: string; paper: string; text: string;}}[] => {
    return [
      {
        name: 'Ocean Breeze',
        colors: {
          primary: '#1976D2',
          secondary: '#26A69A',
          background: '#E1F5FE',
          paper: '#FFFFFF',
          text: '#263238'
        }
      },
      {
        name: 'Sunset Glow',
        colors: {
          primary: '#E91E63',
          secondary: '#FF9800',
          background: '#FFF8E1',
          paper: '#FFFFFF',
          text: '#37474F'
        }
      },
      {
        name: 'Forest Calm',
        colors: {
          primary: '#388E3C',
          secondary: '#8D6E63',
          background: '#E8F5E9',
          paper: '#FFFFFF',
          text: '#212121'
        }
      },
      {
        name: 'Deep Purple',
        colors: {
          primary: '#673AB7',
          secondary: '#00BCD4',
          background: '#EDE7F6',
          paper: '#FFFFFF',
          text: '#263238'
        }
      },
      {
        name: 'Elegant Dark',
        colors: {
          primary: '#BB86FC',
          secondary: '#03DAC6',
          background: '#121212',
          paper: '#1E1E1E',
          text: '#E0E0E0'
        }
      }
    ];
  }
};

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({ 
  label, 
  value, 
  onChange,
  onKeyDown,
  inputProps 
}) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const colorBoxRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  
  // Generate suggested colors when value changes
  useEffect(() => {
    const complementary = colorUtils.getComplementaryColor(value);
    const analogous = colorUtils.getAnalogousColors(value);
    setSuggestedColors([complementary, ...analogous]);
  }, [value]);
  
  const handleColorBoxClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };
  
  const handleColorBoxKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (colorBoxRef.current) {
        handleColorBoxClick(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };
  
  const handleSuggestedColorClick = (color: string) => {
    onChange(color);
  };
  
  const handleCopyColor = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography id={`${label.toLowerCase()}-color-label`} variant="subtitle2" sx={{ mr: 1 }}>
          {label}
        </Typography>
        
        <Tooltip title={`Select ${label} color`}>
          <Box 
            ref={colorBoxRef}
            role="button"
            aria-label={`Choose ${label} color`}
            aria-describedby={`${label.toLowerCase()}-color-label`}
            tabIndex={0}
            onKeyDown={handleColorBoxKeyDown}
            onClick={handleColorBoxClick}
            sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              bgcolor: value,
              border: '2px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              mr: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 0 8px rgba(0,0,0,0.2)'
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2
              }
            }}
          />
        </Tooltip>
        
        <TextField 
          ref={textFieldRef}
          value={value} 
          size="small"
          inputProps={{
            'aria-label': `${label} color hex value`,
            ...inputProps
          }}
          onChange={(e) => onChange(e.target.value)}
          sx={{ width: 120 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Copy color code">
                  <IconButton 
                    edge="end" 
                    onClick={handleCopyColor}
                    size="small"
                    aria-label={`Copy ${label} color code`}
                  >
                    {copied ? <CheckCircleIcon color="success" fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Suggested colors based on color theory */}
      <Box sx={{ display: 'flex', ml: 5, mb: 1, gap: 1 }}>
        {suggestedColors.map((color, index) => (
          <Tooltip 
            key={index} 
            title={index === 0 ? "Complementary color" : `Analogous color ${index}`}
          >
            <Box
              role="button"
              tabIndex={0}
              aria-label={index === 0 ? "Use complementary color" : `Use analogous color ${index}`}
              onClick={() => handleSuggestedColorClick(color)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSuggestedColorClick(color);
                }
              }}
              sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: color,
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { 
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 4px rgba(0,0,0,0.2)' 
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2
                }
              }}
            />
          </Tooltip>
        ))}
      </Box>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 1 }}>
          <ChromePicker 
            color={value} 
            onChange={(color: ColorResult) => onChange(color.hex)} 
            disableAlpha
          />
        </Paper>
      </Popover>
    </Box>
  );
};

interface ThemePreviewProps {
  theme: {
    primary: string;
    secondary: string;
    background: string;
    paper: string;
    text: string;
  };
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme }) => {
  return (
    <Box sx={{ 
      bgcolor: theme.background, 
      p: 2, 
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      mb: 2
    }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: theme.text, mb: 1 }}>
        Theme Preview
      </Typography>
      
      <Box sx={{ 
        bgcolor: theme.paper, 
        p: 2, 
        borderRadius: 1,
        mb: 2
      }}>
        <Typography variant="body2" sx={{ color: theme.text }}>
          This is how your theme will look
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          size="small"
          sx={{ 
            bgcolor: theme.primary,
            '&:hover': {
              bgcolor: theme.primary,
              filter: 'brightness(0.9)'
            }
          }}
        >
          Primary Button
        </Button>
        
        <Button 
          variant="contained" 
          size="small"
          sx={{ 
            bgcolor: theme.secondary,
            '&:hover': {
              bgcolor: theme.secondary,
              filter: 'brightness(0.9)'
            }
          }}
        >
          Secondary Button
        </Button>
      </Box>
    </Box>
  );
};

interface CustomThemeCreatorProps {
  onClose: () => void;
  open: boolean;
  editTheme?: string;
}

// Add this interface for the ChromePicker color result
interface ColorResult {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
    a?: number;
  };
}

export const CustomThemeCreator: React.FC<CustomThemeCreatorProps> = ({ 
  onClose, 
  open, 
  editTheme 
}) => {
  const { customThemes, addCustomTheme, deleteCustomTheme } = useThemeContext();
  const muiTheme = useMuiTheme();
  const [openCreator, setOpenCreator] = useState(open);
  const [editingTheme, setEditingTheme] = useState<Partial<CustomTheme> | null>(null);
  
  const [themeName, setThemeName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6200EA');
  const [secondaryColor, setSecondaryColor] = useState('#03DAC6');
  const [backgroundColor, setBackgroundColor] = useState('#F5F5F5');
  const [paperColor, setPaperColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#212121');
  
  // For undo functionality
  const [colorHistory, setColorHistory] = useState<{
    themeName: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    paperColor: string;
    textColor: string;
  }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // For notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  
  // For preset palettes
  const [presetsMenuAnchor, setPresetsMenuAnchor] = useState<null | HTMLElement>(null);
  const presetPalettes = colorUtils.getPresetPalettes();
  
  // For dark/light mode toggle
  const [isDarkMode, setIsDarkMode] = useState(false);

  // For tab navigation
  const [tabValue, setTabValue] = useState(0);
  
  // Add to color history when any color changes
  useEffect(() => {
    if (openCreator && primaryColor && secondaryColor && backgroundColor && paperColor && textColor) {
      // Don't add to history if this is initial state setup
      if (historyIndex === -1) {
        setColorHistory([{
          themeName,
          primaryColor,
          secondaryColor,
          backgroundColor,
          paperColor,
          textColor
        }]);
        setHistoryIndex(0);
      } 
      // Don't add to history if nothing changed
      else if (
        colorHistory[historyIndex]?.primaryColor !== primaryColor ||
        colorHistory[historyIndex]?.secondaryColor !== secondaryColor ||
        colorHistory[historyIndex]?.backgroundColor !== backgroundColor ||
        colorHistory[historyIndex]?.paperColor !== paperColor ||
        colorHistory[historyIndex]?.textColor !== textColor ||
        colorHistory[historyIndex]?.themeName !== themeName
      ) {
        // Trim history if we've gone back and made changes
        const newHistory = colorHistory.slice(0, historyIndex + 1);
        setColorHistory([
          ...newHistory, 
          {
            themeName,
            primaryColor,
            secondaryColor,
            backgroundColor,
            paperColor,
            textColor
          }
        ]);
        setHistoryIndex(newHistory.length);
      }
    }
  }, [primaryColor, secondaryColor, backgroundColor, paperColor, textColor, themeName, openCreator]);
  
  useEffect(() => {
    if (openCreator && editTheme) {
      // Find the theme in the customThemes array
      const theme = customThemes.find(theme => theme.id === editTheme);
      if (theme) {
        // Convert context theme to local theme
        const localTheme: Partial<CustomTheme> = {
          id: theme.id,
          name: theme.name,
          primary: theme.primary,
          secondary: theme.secondary,
          background: theme.background,
          paper: theme.paper,
          text: theme.text,
          createdAt: theme.createdAt || new Date().toISOString()
        };
        setEditingTheme(localTheme);
        setThemeName(theme.name);
        setPrimaryColor(theme.primary);
        setSecondaryColor(theme.secondary);
        setBackgroundColor(theme.background);
        setPaperColor(theme.paper);
        setTextColor(theme.text);
        setIsDarkMode(colorUtils.isLightColor(theme.background) ? false : true);
      }
    } else if (openCreator) {
      // Reset for a new theme
      setEditingTheme(null);
      setThemeName('My Custom Theme');
      setPrimaryColor('#6200EA');
      setSecondaryColor('#03DAC6');
      setBackgroundColor('#F5F5F5');
      setPaperColor('#FFFFFF');
      setTextColor('#212121');
      setIsDarkMode(false);
    }
  }, [openCreator, editTheme, customThemes]);
  
  const handleSave = () => {
    if (!themeName.trim()) {
      setSnackbarMessage('Theme name is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Ensure themeId is a non-undefined string
    const themeId = (editingTheme?.id) ? editingTheme.id : uuidv4();
    
    // Create new custom theme using the CustomTheme interface from types
    const newTheme: CustomTheme = {
      id: themeId,
      name: themeName,
      primary: primaryColor,
      secondary: secondaryColor,
      background: backgroundColor,
      paper: paperColor,
      text: textColor,
      createdAt: new Date().toISOString()
    };
    
    addCustomTheme(newTheme);
    setSnackbarMessage('Theme saved successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    setTimeout(() => {
      onClose();
    }, 1000);
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = colorHistory[historyIndex - 1];
      setThemeName(prevState.themeName);
      setPrimaryColor(prevState.primaryColor);
      setSecondaryColor(prevState.secondaryColor);
      setBackgroundColor(prevState.backgroundColor);
      setPaperColor(prevState.paperColor);
      setTextColor(prevState.textColor);
      setHistoryIndex(historyIndex - 1);
      
      setSnackbarMessage('Change undone');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < colorHistory.length - 1) {
      const nextState = colorHistory[historyIndex + 1];
      setThemeName(nextState.themeName);
      setPrimaryColor(nextState.primaryColor);
      setSecondaryColor(nextState.secondaryColor);
      setBackgroundColor(nextState.backgroundColor);
      setPaperColor(nextState.paperColor);
      setTextColor(nextState.textColor);
      setHistoryIndex(historyIndex + 1);
      
      setSnackbarMessage('Change redone');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  };
  
  const handleToggleDarkMode = () => {
    if (isDarkMode) {
      // Switch to light mode
      setBackgroundColor('#F5F5F5');
      setPaperColor('#FFFFFF');
      setTextColor('#212121');
    } else {
      // Switch to dark mode
      setBackgroundColor('#121212');
      setPaperColor('#1E1E1E');
      setTextColor('#E0E0E0');
    }
    setIsDarkMode(!isDarkMode);
  };
  
  const handleOpenPresets = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPresetsMenuAnchor(event.currentTarget);
  };
  
  const handleClosePresets = () => {
    setPresetsMenuAnchor(null);
  };
  
  const handleSelectPreset = (preset: { name: string; colors: { primary: string; secondary: string; background: string; paper: string; text: string; }}) => {
    setThemeName(preset.name);
    setPrimaryColor(preset.colors.primary);
    setSecondaryColor(preset.colors.secondary);
    setBackgroundColor(preset.colors.background);
    setPaperColor(preset.colors.paper);
    setTextColor(preset.colors.text);
    setIsDarkMode(!colorUtils.isLightColor(preset.colors.background));
    
    setSnackbarMessage(`Preset "${preset.name}" applied`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    handleClosePresets();
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleDelete = () => {
    if (editingTheme && editingTheme.id) {
      deleteCustomTheme(editingTheme.id);
      onClose();
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Custom Themes
        </Typography>
        
        <Button 
          id="custom-theme-creator-button"
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreator(true)}
          aria-label="Create new custom theme"
        >
          Create Theme
        </Button>
      </Box>
      
      <Dialog 
        open={openCreator} 
        onClose={() => setOpenCreator(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="theme-creator-dialog-title"
      >
        <DialogTitle id="theme-creator-dialog-title">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingTheme ? 'Edit' : 'Create'} Custom Theme
            </Typography>
            <Box>
              <Tooltip title="Toggle dark/light mode">
                <IconButton 
                  onClick={handleToggleDarkMode}
                  color="inherit"
                  aria-label="Toggle between dark and light mode"
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Use preset palette">
                <IconButton 
                  onClick={handleOpenPresets}
                  color="inherit"
                  aria-label="Choose preset color palette"
                  aria-haspopup="true"
                >
                  <PaletteIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Undo">
                <span>
                  <IconButton 
                    onClick={handleUndo}
                    color="inherit"
                    disabled={historyIndex <= 0}
                    aria-label="Undo last color change"
                  >
                    <UndoIcon />
                  </IconButton>
                </span>
              </Tooltip>
              
              <IconButton 
                edge="end" 
                onClick={() => setOpenCreator(false)}
                aria-label="Close dialog"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                aria-label="Theme editor tabs"
              >
                <Tab 
                  label="Basic Settings" 
                  icon={<TuneIcon />} 
                  id="theme-tab-0"
                  aria-controls="theme-tabpanel-0"
                />
                <Tab 
                  label="Preview" 
                  icon={<PreviewIcon />} 
                  id="theme-tab-1"
                  aria-controls="theme-tabpanel-1"
                />
              </Tabs>
              
              <Box 
                role="tabpanel"
                hidden={tabValue !== 0}
                id="theme-tabpanel-0"
                aria-labelledby="theme-tab-0"
                sx={{ mt: 2 }}
              >
                {tabValue === 0 && (
                  <>
                    <TextField 
                      fullWidth
                      label="Theme Name"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      margin="normal"
                      variant="outlined"
                      inputProps={{
                        'aria-label': 'Theme name'
                      }}
                    />
                    
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Color Settings
                    </Typography>
                    
                    <ColorPickerField 
                      label="Primary"
                      value={primaryColor}
                      onChange={setPrimaryColor}
                    />
                    
                    <ColorPickerField 
                      label="Secondary"
                      value={secondaryColor}
                      onChange={setSecondaryColor}
                    />
                    
                    <ColorPickerField 
                      label="Background"
                      value={backgroundColor}
                      onChange={setBackgroundColor}
                    />
                    
                    <ColorPickerField 
                      label="Paper"
                      value={paperColor}
                      onChange={setPaperColor}
                    />
                    
                    <ColorPickerField 
                      label="Text"
                      value={textColor}
                      onChange={setTextColor}
                    />
                  </>
                )}
              </Box>
              
              <Box 
                role="tabpanel"
                hidden={tabValue !== 1}
                id="theme-tabpanel-1"
                aria-labelledby="theme-tab-1"
                sx={{ mt: 2 }}
              >
                {tabValue === 1 && (
                  <Box sx={{ height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Theme Preview
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        bgcolor: backgroundColor, 
                        p: 2, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 2,
                        minHeight: 300,
                        overflowY: 'auto'
                      }}
                    >
                      <Typography variant="h5" sx={{ color: textColor, mb: 2 }}>
                        {themeName}
                      </Typography>
                      
                      <Paper sx={{ bgcolor: paperColor, p: 2, mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 'bold' }}>
                          Content Area
                        </Typography>
                        <Typography variant="body1" sx={{ color: textColor }}>
                          This is how text will appear on paper surfaces.
                        </Typography>
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            sx={{ 
                              bgcolor: primaryColor,
                              '&:hover': {
                                bgcolor: primaryColor,
                                filter: 'brightness(0.9)'
                              }
                            }}
                          >
                            Primary Button
                          </Button>
                          
                          <Button 
                            variant="contained" 
                            sx={{ 
                              bgcolor: secondaryColor,
                              '&:hover': {
                                bgcolor: secondaryColor,
                                filter: 'brightness(0.9)'
                              }
                            }}
                          >
                            Secondary Button
                          </Button>
                        </Box>
                      </Paper>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ bgcolor: paperColor, p: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: textColor }}>
                              Card Example
                            </Typography>
                            <Typography variant="body2" sx={{ color: textColor + '99' }}>
                              This is secondary text
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ bgcolor: paperColor, p: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: textColor }}>
                              Another Card
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                              <Button 
                                size="small" 
                                sx={{ 
                                  color: primaryColor,
                                }}
                              >
                                Action
                              </Button>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Active Preview
                </Typography>
                
                <ThemePreview
                  theme={{
                    primary: primaryColor,
                    secondary: secondaryColor,
                    background: backgroundColor,
                    paper: paperColor,
                    text: textColor
                  }}
                />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    This preview shows how your theme will look in the app
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Color Harmony
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    avatar={<Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: primaryColor 
                    }} />} 
                    label="Primary" 
                  />
                  <Chip 
                    avatar={<Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: secondaryColor 
                    }} />} 
                    label="Secondary" 
                  />
                  <Chip 
                    avatar={<Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: backgroundColor 
                    }} />} 
                    label="Background" 
                  />
                  <Chip 
                    avatar={<Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: paperColor 
                    }} />} 
                    label="Paper" 
                  />
                  <Chip 
                    avatar={<Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: textColor 
                    }} />} 
                    label="Text" 
                  />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Color Contrast Check:
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    {/* Simple contrast check - just evaluate if text on backgrounds will be readable */}
                    <Chip 
                      label={colorUtils.isLightColor(primaryColor) !== colorUtils.isLightColor(paperColor) 
                        ? "Good contrast" 
                        : "Check contrast between primary and paper"} 
                      color={colorUtils.isLightColor(primaryColor) !== colorUtils.isLightColor(paperColor) 
                        ? "success" 
                        : "warning"}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    
                    <Chip 
                      label={colorUtils.isLightColor(backgroundColor) !== colorUtils.isLightColor(textColor) 
                        ? "Good text contrast" 
                        : "Check text on background contrast"} 
                      color={colorUtils.isLightColor(backgroundColor) !== colorUtils.isLightColor(textColor) 
                        ? "success" 
                        : "warning"}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {/* Preset Colors Menu */}
          <Menu
            anchorEl={presetsMenuAnchor}
            open={Boolean(presetsMenuAnchor)}
            onClose={handleClosePresets}
          >
            {presetPalettes.map((preset, index) => (
              <MenuItem 
                key={index} 
                onClick={() => handleSelectPreset(preset)}
                dense
              >
                <ListItemIcon>
                  <Box sx={{
                    display: 'flex',
                    '& > *': {
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%',
                      mr: 0.5
                    }
                  }}>
                    <Box sx={{ bgcolor: preset.colors.primary }} />
                    <Box sx={{ bgcolor: preset.colors.secondary }} />
                    <Box sx={{ bgcolor: preset.colors.background }} />
                  </Box>
                </ListItemIcon>
                <ListItemText primary={preset.name} />
              </MenuItem>
            ))}
          </Menu>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setOpenCreator(false)}
            variant="outlined"
            aria-label="Cancel theme creation"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            aria-label="Save theme"
          >
            Save Theme
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* List of saved themes */}
      {customThemes.length > 0 ? (
        <Grid container spacing={2}>
          {customThemes.map(theme => (
            <Grid item xs={12} sm={6} md={4} key={theme.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box 
                  sx={{ 
                    height: 60,
                    bgcolor: theme.background,
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: theme.primary,
                        mr: 1
                      }}
                    />
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: theme.secondary,
                        mr: 1
                      }}
                    />
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: theme.paper
                      }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {theme.name}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    {theme.createdAt ? new Date(theme.createdAt).toLocaleDateString() : 'Recently created'}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', p: 1 }}>
                  <Tooltip title="Apply this theme">
                    <Button 
                      size="small" 
                      fullWidth
                      onClick={() => {
                        // Implement the logic to apply the theme
                      }}
                      aria-label={`Apply theme ${theme.name}`}
                    >
                      Apply
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Edit this theme">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        // Implement the logic to edit the theme
                      }}
                      aria-label={`Edit theme ${theme.name}`}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete this theme">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        // Implement the logic to delete the theme
                      }}
                      aria-label={`Delete theme ${theme.name}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: 'background.default',
            textAlign: 'center'
          }}
        >
          <ColorLensIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Custom Themes Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first custom theme to personalize your experience
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenCreator(true)}
            aria-label="Create first custom theme"
          >
            Create First Theme
          </Button>
        </Paper>
      )}
    </Paper>
  );
};

export default CustomThemeCreator; 