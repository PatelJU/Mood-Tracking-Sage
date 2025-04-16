import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  useTheme as useMuiTheme,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { ThemeType, CustomTheme } from '../../types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import WavesIcon from '@mui/icons-material/Waves';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import ForestIcon from '@mui/icons-material/Forest';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { CustomThemeCreator } from './CustomThemeCreator';

interface ThemeOptionProps {
  themeType: ThemeType;
  isActive: boolean;
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ themeType, isActive, onClick }) => {
  // Theme-specific properties
  const getThemeProperties = (): { 
    icon: React.ReactNode; 
    label: string; 
    colors: string[]; 
    description: string;
  } => {
    switch (themeType) {
      case 'light':
        return {
          icon: <LightModeIcon />,
          label: 'Light',
          colors: ['#FFFFFF', '#F5F5F5', '#6200EA', '#03DAC6'],
          description: 'Clean and bright theme with purple accents'
        };
      case 'dark':
        return {
          icon: <DarkModeIcon />,
          label: 'Dark',
          colors: ['#121212', '#1E1E1E', '#BB86FC', '#03DAC6'],
          description: 'Dark mode with purple and teal accents'
        };
      case 'ocean':
        return {
          icon: <WavesIcon />,
          label: 'Ocean',
          colors: ['#E0F7FA', '#FFFFFF', '#006064', '#1A237E'],
          description: 'Calming blue and teal colors inspired by the sea'
        };
      case 'sunset':
        return {
          icon: <WbTwilightIcon />,
          label: 'Sunset',
          colors: ['#FFF8E1', '#FFFFFF', '#FF6F00', '#AD1457'],
          description: 'Warm oranges and pinks like a beautiful sunset'
        };
      case 'forest':
        return {
          icon: <ForestIcon />,
          label: 'Forest',
          colors: ['#E8F5E9', '#FFFFFF', '#2E7D32', '#795548'],
          description: 'Natural greens and browns inspired by forests'
        };
      case 'pastel':
        return {
          icon: <ColorLensIcon />,
          label: 'Pastel',
          colors: ['#F3E5F5', '#FFFFFF', '#9C27B0', '#26A69A'],
          description: 'Soft pastel colors for a gentle experience'
        };
    }
  };
  
  const { icon, label, colors, description } = getThemeProperties();
  
  return (
    <Card 
      elevation={isActive ? 4 : 1} 
      sx={{ 
        borderRadius: 2,
        border: isActive ? '2px solid' : '1px solid',
        borderColor: isActive ? 'primary.main' : 'divider',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.2s ease',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 2 }}>
        <Box sx={{ position: 'relative' }}>
          {isActive && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Active"
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: -16,
                right: -8,
                zIndex: 1,
              }}
            />
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ mr: 1, color: colors[2] }}>
              {icon}
            </Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {label} Theme
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {colors.map((color, index) => (
              <Tooltip key={index} title={color}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: color,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

// Custom Theme Option component to display saved custom themes
interface CustomThemeOptionProps {
  theme: CustomTheme;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CustomThemeOption: React.FC<CustomThemeOptionProps> = ({ 
  theme, 
  isActive, 
  onClick, 
  onEdit,
  onDelete
}) => {
  const colors = [theme.background, theme.paper, theme.primary, theme.secondary];
  
  return (
    <Card 
      elevation={isActive ? 4 : 1} 
      sx={{ 
        borderRadius: 2,
        border: isActive ? '2px solid' : '1px solid',
        borderColor: isActive ? 'primary.main' : 'divider',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.2s ease',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardActionArea onClick={onClick} sx={{ p: 2 }}>
          <Box sx={{ position: 'relative' }}>
            {isActive && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Active"
                color="primary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: -16,
                  right: -8,
                  zIndex: 1,
                }}
              />
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ mr: 1, color: theme.primary }}>
                <ColorLensIcon />
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {theme.name}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {colors.map((color, index) => (
                <Tooltip key={index} title={color}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: color,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Custom Theme
            </Typography>
          </Box>
        </CardActionArea>
        
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex' }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Tooltip title="Edit Theme">
              <PaletteIcon fontSize="small" />
            </Tooltip>
          </IconButton>
          
          <IconButton 
            size="small" 
            color="error"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Tooltip title="Delete Theme">
              <CloseIcon fontSize="small" />
            </Tooltip>
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

interface ThemeSwitcherProps {
  variant?: 'button' | 'full';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = 'full' }) => {
  const { currentTheme, setTheme, availableThemes, customThemes, deleteCustomTheme, addCustomTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [open, setOpen] = useState(false);
  const [isCustomThemeCreatorOpen, setIsCustomThemeCreatorOpen] = useState(false);
  const [themeToEdit, setThemeToEdit] = useState<CustomTheme | null>(null);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | undefined>(undefined);
  const [tabValue, setTabValue] = useState(0);
  
  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleThemeChange = (theme: ThemeType | string) => {
    setTheme(theme);
    if (variant === 'full') {
      handleClose();
    } else {
      handleMenuClose();
    }
  };
  
  const handleOpenCustomThemeCreator = () => {
    setIsCustomThemeCreatorOpen(true);
    setThemeToEdit(null);
    if (variant === 'full') {
      handleClose();
    } else {
      handleMenuClose();
    }
  };
  
  const handleCloseCustomThemeCreator = () => {
    setIsCustomThemeCreatorOpen(false);
  };
  
  const handleEditTheme = (theme: CustomTheme) => {
    setThemeToEdit(theme);
    setIsCustomThemeCreatorOpen(true);
    if (variant === 'full') {
      handleClose();
    }
  };
  
  const handleDeleteTheme = (themeId: string) => {
    setThemeToDelete(themeId);
    setConfirmDeleteOpen(true);
  };
  
  const confirmDeleteTheme = () => {
    if (themeToDelete) {
      deleteCustomTheme(themeToDelete);
      setThemeToDelete(null);
    }
    setConfirmDeleteOpen(false);
  };
  
  const cancelDeleteTheme = () => {
    setThemeToDelete(null);
    setConfirmDeleteOpen(false);
  };
  
  const handleSaveCustomTheme = (theme: CustomTheme) => {
    addCustomTheme(theme);
    setTheme(theme.id);
    handleCloseCustomThemeCreator();
  };
  
  // Button variant handlers
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleCloseCreator = () => {
    setCreatorOpen(false);
    setEditingThemeId(undefined);
  };
  
  // For button variant
  if (variant === 'button') {
    const currentThemeIcon = () => {
      if (currentTheme === 'light') return <LightModeIcon />;
      if (currentTheme === 'dark') return <DarkModeIcon />;
      if (currentTheme === 'ocean') return <WavesIcon />;
      if (currentTheme === 'sunset') return <WbTwilightIcon />;
      if (currentTheme === 'forest') return <ForestIcon />;
      // For custom themes or other default themes
      return <ColorLensIcon />;
    };
    
    return (
      <>
        <Tooltip title="Change theme">
          <IconButton 
            onClick={handleButtonClick} 
            color="inherit"
            aria-label="change theme"
          >
            {currentThemeIcon()}
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => handleThemeChange('light')}>
            <ListItemIcon>
              <LightModeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Light</ListItemText>
            {currentTheme === 'light' && <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />}
          </MenuItem>
          
          <MenuItem onClick={() => handleThemeChange('dark')}>
            <ListItemIcon>
              <DarkModeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dark</ListItemText>
            {currentTheme === 'dark' && <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />}
          </MenuItem>
          
          <MenuItem onClick={() => handleThemeChange('ocean')}>
            <ListItemIcon>
              <WavesIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ocean</ListItemText>
            {currentTheme === 'ocean' && <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />}
          </MenuItem>
          
          <MenuItem onClick={() => handleThemeChange('sunset')}>
            <ListItemIcon>
              <WbTwilightIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sunset</ListItemText>
            {currentTheme === 'sunset' && <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />}
          </MenuItem>
          
          <MenuItem onClick={() => handleThemeChange('forest')}>
            <ListItemIcon>
              <ForestIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Forest</ListItemText>
            {currentTheme === 'forest' && <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />}
          </MenuItem>
          
          {customThemes.length > 0 && <Divider />}
          
          {customThemes.map(theme => (
            <MenuItem key={theme.id} onClick={() => handleThemeChange(theme.id)}>
              <ListItemIcon>
                <ColorLensIcon fontSize="small" sx={{ color: theme.primary }} />
              </ListItemIcon>
              <ListItemText>{theme.name}</ListItemText>
              {currentTheme === theme.id && <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />}
            </MenuItem>
          ))}
          
          <Divider />
          
          <MenuItem onClick={handleOpenCustomThemeCreator}>
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Create Custom Theme</ListItemText>
          </MenuItem>
        </Menu>
        
        <CustomThemeCreator 
          open={creatorOpen || tabValue === 1} 
          onClose={handleCloseCreator}
          editTheme={editingThemeId}
        />
      </>
    );
  }
  
  // Full variant (default)
  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
            Theme Settings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCustomThemeCreator}
          >
            Create Custom Theme
          </Button>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Choose a theme
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {availableThemes.map((themeType) => (
            <Grid item xs={12} sm={6} md={4} key={themeType}>
              <ThemeOption 
                themeType={themeType} 
                isActive={currentTheme === themeType}
                onClick={() => handleThemeChange(themeType)}
              />
            </Grid>
          ))}
        </Grid>
        
        {customThemes.length > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Your Custom Themes
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {customThemes.map((theme) => (
                <Grid item xs={12} sm={6} md={4} key={theme.id}>
                  <CustomThemeOption 
                    theme={theme}
                    isActive={currentTheme === theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    onEdit={() => handleEditTheme(theme)}
                    onDelete={() => handleDeleteTheme(theme.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
      
      {/* Custom Theme Creator Dialog */}
      <CustomThemeCreator 
        open={creatorOpen || tabValue === 1} 
        onClose={handleCloseCreator}
        editTheme={editingThemeId}
      />
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={cancelDeleteTheme}
      >
        <DialogTitle>Delete Theme</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this theme? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteTheme} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteTheme} color="error" variant="contained" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ThemeSwitcher; 