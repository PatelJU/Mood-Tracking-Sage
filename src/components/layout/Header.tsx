import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box,
  Badge,
  Tooltip,
  Avatar,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import { 
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { currentTheme, setTheme } = useAppTheme();
  const isDarkMode = currentTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={12}
      sx={{ 
        background: 'linear-gradient(90deg, #09090b 0%, #18181b 100%)',
        borderBottom: '1px solid rgba(82, 109, 254, 0.25)',
        height: '80px',
        zIndex: 1200,
      }}
    >
      <Toolbar 
        sx={{ 
          height: '80px',
          minHeight: '80px',
          padding: { xs: '0 20px', md: '0 40px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Left section with menu button and app title */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3
        }}>
          {isMobile && onMenuToggle && (
            <IconButton
              onClick={onMenuToggle}
              sx={{ 
                color: '#f0f4fa',
                width: 48,
                height: 48,
                border: '1px solid rgba(82, 109, 254, 0.5)',
                borderRadius: '14px',
                background: 'rgba(82, 109, 254, 0.35)',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(82, 109, 254, 0.5)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 16px -2px rgba(82, 109, 254, 0.25)'
                }
              }}
            >
              <MenuIcon sx={{ fontSize: '1.7rem', filter: 'drop-shadow(0 2px 4px rgba(82, 109, 254, 0.5))' }} />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* App logo/accent */}
            <Box sx={{ 
              width: '10px',
              height: '40px',
              background: 'linear-gradient(180deg, #526dfe 0%, #9333ea 100%)',
              borderRadius: '6px',
              mr: 3,
              boxShadow: '0 0 20px rgba(82, 109, 254, 0.8), 0 0 40px rgba(82, 109, 254, 0.4)'
            }} />
            
            {/* App title */}
            <Typography 
              variant="h4"
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(90deg, #0c4a6e 20%, #172554 80%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', sm: '2rem' },
                letterSpacing: '1.2px',
                position: 'relative',
                filter: 'drop-shadow(0 0 8px rgba(148, 163, 255, 0.8))',
                textTransform: 'uppercase',
                border: '2px solid transparent',
                borderImage: 'linear-gradient(90deg, #0c4a6e, #172554) 1',
                borderLeft: 0,
                borderTop: 0,
                borderRight: 0,
                paddingBottom: '6px',
                marginBottom: '-6px',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
                  zIndex: -1,
                  filter: 'blur(12px)',
                  opacity: 0.7,
                  borderRadius: '4px',
                  transform: 'translateY(2px)'
                }
              }}
            >
              Mood Tracking
            </Typography>
          </Box>
        </Box>
        
        {/* Right section with action buttons */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 2.5, sm: 3.5 }
        }}>
          {/* Theme toggle button */}
          <Tooltip title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton 
              onClick={toggleTheme}
              aria-label="Toggle theme"
              sx={{ 
                width: 48,
                height: 48,
                background: 'rgba(82, 109, 254, 0.35)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                color: '#f0f4fa',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(82, 109, 254, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  background: 'rgba(82, 109, 254, 0.5)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 16px -2px rgba(82, 109, 254, 0.25), 0 0 0 1px rgba(82, 109, 254, 0.6)'
                }
              }}
            >
              {isDarkMode ? 
                <LightModeIcon sx={{ fontSize: '1.6rem', filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }} /> : 
                <DarkModeIcon sx={{ fontSize: '1.6rem', filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }} />
              }
            </IconButton>
          </Tooltip>
          
          {/* Notifications button */}
          <Tooltip title="Notifications">
            <IconButton 
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              sx={{ 
                width: 48,
                height: 48,
                background: 'rgba(82, 109, 254, 0.35)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                color: '#f0f4fa',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(82, 109, 254, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                p: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { 
                  background: 'rgba(82, 109, 254, 0.5)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 16px -2px rgba(82, 109, 254, 0.25), 0 0 0 1px rgba(82, 109, 254, 0.6)'
                }
              }}
            >
              <Badge 
                badgeContent={3} 
                sx={{
                  '& .MuiBadge-badge': {
                    minWidth: '24px',
                    height: '24px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: '2px solid #09090b', 
                    padding: '0 6px',
                    transform: 'translate(25%, -25%)',
                    boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.3), 0 4px 8px -2px rgba(239, 68, 68, 0.6)'
                  }
                }}
              >
                <NotificationsIcon 
                  sx={{ 
                    fontSize: '1.6rem',
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
                  }} 
                />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Profile button */}
          <IconButton
            onClick={() => navigate('/profile')}
            aria-label="User profile"
            sx={{ 
              width: 48,
              height: 48,
              borderRadius: '14px',
              border: '2px solid rgba(82, 109, 254, 0.6)',
              p: 0,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #526dfe 0%, #9333ea 100%)',
              boxShadow: '0 4px 12px rgba(82, 109, 254, 0.35), 0 0 20px rgba(82, 109, 254, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: '0 8px 16px rgba(82, 109, 254, 0.5), 0 0 30px rgba(82, 109, 254, 0.3)',
                border: '2px solid rgba(82, 109, 254, 0.8)'
              }
            }}
          >
            <Avatar
              alt="User"
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                color: '#526dfe',
                fontWeight: 'bold',
                fontSize: '1.4rem',
                boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              D
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 