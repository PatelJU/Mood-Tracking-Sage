import React, { useState } from 'react';
import { Box, Button, Grid, IconButton, Paper, Typography, useTheme, Tooltip } from '@mui/material';
import { LightMode, DarkMode, ColorLens, Palette } from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { CustomThemeCreator } from '../components/themes/CustomThemeCreator';

interface ThemeSwitcherProps {
  variant?: 'button' | 'full';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = 'full' }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    currentTheme,
    changeTheme,
    availableThemes,
    customThemes
  } = useThemeContext();
  const theme = useTheme();
  
  // Add the missing state variables
  const [isCustomThemeCreatorOpen, setIsCustomThemeCreatorOpen] = useState(false);
  const [themeToEdit, setThemeToEdit] = useState<{ id: string } | null>(null);
  
  // Add the missing handler functions
  const handleOpenCustomThemeCreator = (themeId?: string) => {
    if (themeId) {
      setThemeToEdit({ id: themeId });
    } else {
      setThemeToEdit(null);
    }
    setIsCustomThemeCreatorOpen(true);
  };
  
  const handleCloseCustomThemeCreator = () => {
    setIsCustomThemeCreatorOpen(false);
    setThemeToEdit(null);
  };

  // If we're displaying this as just a button in the navbar
  if (variant === 'button') {
    return (
      <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
        <IconButton color="inherit" onClick={toggleDarkMode} aria-label="Toggle theme">
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>
    );
  }

  const getThemeCard = (themeName: string, isCustom: boolean = false) => {
    const isActive = currentTheme === themeName;
    
    // Get sample colors
    let primaryColor = '#3f51b5';
    let secondaryColor = '#f50057';
    let bgColor = '#ffffff';
    
    if (isCustom) {
      const customTheme = customThemes.find(t => t.id === themeName);
      if (customTheme) {
        primaryColor = customTheme.primary;
        secondaryColor = customTheme.secondary;
        bgColor = customTheme.background;
      }
    } else {
      // Pre-defined theme colors
      switch (themeName) {
        case 'light':
          primaryColor = '#3f51b5';
          secondaryColor = '#f50057';
          bgColor = '#ffffff';
          break;
        case 'dark':
          primaryColor = '#90caf9';
          secondaryColor = '#f48fb1';
          bgColor = '#303030';
          break;
        case 'forest':
          primaryColor = '#2e7d32';
          secondaryColor = '#ffc107';
          bgColor = '#f1f8e9';
          break;
        case 'navy':
          primaryColor = '#1a237e';
          secondaryColor = '#ff5722';
          bgColor = '#e8eaf6';
          break;
        case 'lavender':
          primaryColor = '#9c27b0';
          secondaryColor = '#4caf50';
          bgColor = '#f3e5f5';
          break;
      }
    }
    
    const themeDisplayName = isCustom 
      ? customThemes.find(t => t.id === themeName)?.name || 'Custom Theme'
      : `${themeName.charAt(0).toUpperCase()}${themeName.slice(1)} Theme`;
    
    return (
      <Paper 
        elevation={isActive ? 8 : 1} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          border: isActive ? `2px solid ${theme.palette.primary.main}` : 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease'
        }}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight={isActive ? 'bold' : 'normal'}
          gutterBottom
        >
          {themeDisplayName}
        </Typography>
        
        <Box 
          sx={{ 
            height: 100, 
            bgcolor: bgColor,
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
            border: '1px solid rgba(0,0,0,0.12)'
          }}
        >
          <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: primaryColor,
              mr: 1 
            }} 
          />
          <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: secondaryColor 
            }} 
          />
        </Box>
        
        <Button 
          variant={isActive ? "contained" : "outlined"} 
          onClick={() => changeTheme(themeName)}
          fullWidth
          size="small"
          sx={{ mt: 'auto' }}
        >
          {isActive ? 'Current Theme' : 'Use Theme'}
        </Button>
      </Paper>
    );
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Theme Settings
        </Typography>
        
        <IconButton 
          onClick={toggleDarkMode} 
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          sx={{ mr: 2 }}
        >
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Box>
      
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Available Themes
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {availableThemes.map(themeName => (
          <Grid item xs={12} sm={6} md={4} key={themeName}>
            {getThemeCard(themeName)}
          </Grid>
        ))}
      </Grid>
      
      {customThemes.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 4 }}>
            Custom Themes
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {customThemes.map(theme => (
              <Grid item xs={12} sm={6} md={4} key={theme.id}>
                {getThemeCard(theme.id, true)}
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleOpenCustomThemeCreator()}
          startIcon={<ColorLens />}
          size="large"
          sx={{ mr: 2 }}
        >
          Create Custom Theme
        </Button>
        
        <Button 
          variant="outlined" 
          component={Link} 
          to="/themes/customize"
          startIcon={<Palette />}
          size="large"
        >
          Customize Current Theme
        </Button>
      </Box>

      <CustomThemeCreator 
        open={isCustomThemeCreatorOpen}
        onClose={handleCloseCustomThemeCreator}
        editTheme={themeToEdit?.id}
      />
    </Box>
  );
};

export default ThemeSwitcher; 