import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Typography, 
  IconButton, 
  Drawer,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
  Tooltip,
  Zoom,
  Paper
} from '@mui/material';
import {
  Dashboard,
  History,
  Analytics,
  Insights,
  Spa,
  CalendarToday,
  ChevronRight as ExpandIcon,
  ChevronLeft as CollapseIcon,
  EmojiEvents as TrophyIcon,
  BubbleChart as VisualizationsIcon,
  NoteAlt as JournalIcon
} from '@mui/icons-material';
import { useTheme as useThemeContext } from '../../context/ThemeContext';

interface NavigationProps {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navigation: React.FC<NavigationProps> = ({ drawerOpen, setDrawerOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentTheme } = useThemeContext();
  
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const navItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Journal', icon: <JournalIcon />, path: '/journal' },
    { text: 'History', icon: <History />, path: '/history' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'Visualizations', icon: <VisualizationsIcon />, path: '/visualizations' },
    { text: 'Calendar', icon: <CalendarToday />, path: '/calendar' },
    { text: 'Insights', icon: <Insights />, path: '/insights' },
    { text: 'Mindfulness', icon: <Spa />, path: '/mindfulness' },
    { text: 'Rewards', icon: <TrophyIcon />, path: '/rewards' }
  ];
  
  // Mock user data (until context is fixed)
  const mockUser = {
    username: 'Demo User',
    avatarUrl: ''
  };

  return (
    <>
      {/* Top App Bar */}
      <AppBar 
        position="fixed" 
        className="dark-bg"
        sx={{ 
          display: 'none', // Hide the duplicate AppBar since we're using Header.tsx now
          zIndex: 1300,
          boxShadow: 'none',
          background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.98), rgba(58, 12, 163, 0.98))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          height: '64px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
      </AppBar>
      
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 270,
              boxSizing: 'border-box',
              background: 'var(--surface-glass-light-solid)',
              boxShadow: 'var(--shadow-lg)',
              border: 'none',
              zIndex: 1200
            },
          }}
        >
          <Box sx={{ pt: 8, pb: 2, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              alt={mockUser.username} 
              src={mockUser.avatarUrl}
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 2,
                border: '4px solid white',
                boxShadow: 'var(--shadow-md)',
                bgcolor: 'var(--color-primary)'
              }}
            />
            <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
              {mockUser.username}
            </Typography>
          </Box>
          
          <Box sx={{ px: 2, pb: 2 }}>
            {navItems.map((item) => (
              <Paper
                key={item.text}
                elevation={location.pathname === item.path ? 2 : 0}
                sx={{
                  mb: 1,
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-md)',
                  bgcolor: location.pathname === item.path 
                    ? 'var(--color-primary-100)' 
                    : 'transparent',
                  transition: 'all var(--motion-medium)',
                }}
              >
                <Box
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.5,
                    px: 2,
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.08)',
                      transform: 'translateX(4px)'
                    },
                    ...(location.pathname === item.path && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: '3px',
                        background: 'linear-gradient(to bottom, var(--color-primary), var(--color-secondary))',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                      }
                    })
                  }}
                >
                  <Box 
                    className="icon-container"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      mr: 2,
                      color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-dark-secondary)',
                      bgcolor: location.pathname === item.path ? 'var(--color-primary-100)' : 'rgba(255, 255, 255, 0.7)',
                      boxShadow: location.pathname === item.path ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography 
                    sx={{ 
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      fontSize: '0.95rem',
                      color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-dark)',
                      ...(location.pathname === item.path && {
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      })
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Drawer>
      )}
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="aside"
          className={`sidebar ${expanded ? 'expanded' : ''}`}
          sx={{
            width: expanded ? 240 : 70,
            transition: 'width var(--motion-medium)',
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            paddingTop: '100px',
            background: 'var(--surface-glass-light-solid)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1200,
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Box className="nav-items" sx={{ mt: 1, width: '100%', px: 1 }}>
            {navItems.map((item) => (
              <Tooltip
                key={item.text}
                title={!expanded ? item.text : ""}
                placement="right"
                TransitionComponent={Zoom}
                arrow
              >
                <Paper
                  elevation={location.pathname === item.path ? 2 : 0}
                  sx={{
                    my: 0.8,
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    bgcolor: location.pathname === item.path ? 'var(--color-primary-100)' : 'transparent',
                    border: location.pathname === item.path ? '1px solid rgba(99, 102, 241, 0.2)' : 'none',
                    boxShadow: location.pathname === item.path ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all var(--motion-medium)',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      boxShadow: 'var(--shadow-sm)'
                    }
                  }}
                >
                  <Box
                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      height: '46px',
                      display: 'flex',
                      alignItems: 'center',
                      px: expanded ? 2 : 1,
                      position: 'relative',
                      ...(location.pathname === item.path && {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: '3px',
                          background: 'linear-gradient(to bottom, var(--color-primary), var(--color-secondary))',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                        }
                      })
                    }}
                  >
                    <Box 
                      className="icon-container"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 36,
                        height: 36,
                        borderRadius: '50%',
                        color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-dark-secondary)',
                        bgcolor: location.pathname === item.path ? 'var(--color-primary-100)' : 'rgba(255, 255, 255, 0.7)',
                        boxShadow: location.pathname === item.path ? 'var(--shadow-sm)' : 'none',
                      }}
                    >
                      {item.icon}
                    </Box>
                    
                    {expanded && (
                      <Typography
                        className="nav-item-text"
                        sx={{
                          opacity: expanded ? 1 : 0,
                          ml: 1.5,
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          fontSize: '0.95rem',
                          color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-dark)',
                          transition: 'opacity var(--motion-medium)',
                          ...(location.pathname === item.path && {
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: 'none'
                          })
                        }}
                      >
                        {item.text}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Tooltip>
            ))}
          </Box>
          
          <Box className="nav-footer" sx={{ 
            mt: 'auto', 
            mb: 3, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: 2
          }}>
            <IconButton
              onClick={toggleExpanded}
              size="small"
              sx={{ 
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--color-primary)',
                width: 36,
                height: 36,
                boxShadow: 'var(--shadow-sm)',
                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.2)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Navigation; 