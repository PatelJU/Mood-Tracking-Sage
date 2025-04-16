import React, { useState, useEffect } from 'react';
import { Box, Container, useMediaQuery, useTheme, IconButton, Tooltip } from '@mui/material';
import { ChevronRight as ExpandIcon, ChevronLeft as CollapseIcon } from '@mui/icons-material';
import Header from './Header';
import Navigation from '../nav/Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Handle sidebar expansion for content adjustment
  const handleSidebarExpansion = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  // Toggle sidebar expansion directly
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };
  
  return (
    <Box className="app-container">
      <Header onMenuToggle={toggleDrawer} />
      <Navigation 
        drawerOpen={drawerOpen} 
        setDrawerOpen={setDrawerOpen} 
        onSidebarExpand={handleSidebarExpansion}
        forceExpanded={sidebarExpanded}
      />
      
      {/* Fixed position toggle button visible regardless of sidebar state */}
      {!isMobile && (
        <Tooltip title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"} placement="right">
          <IconButton
            onClick={toggleSidebar}
            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            sx={{
              position: 'fixed',
              left: sidebarExpanded ? '224px' : '54px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1400,
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              color: 'white',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2), 0 0 10px rgba(99, 102, 241, 0.5)',
              border: '2px solid white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-50%) scale(1.1)',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.25), 0 0 15px rgba(99, 102, 241, 0.6)',
              },
            }}
          >
            {sidebarExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Tooltip>
      )}
      
      <Box className={`content-wrapper ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
        <Box
          component="main"
          className="main-content"
          sx={{
            paddingTop: '100px', // Increased from 90px to 100px (80px header + 20px buffer)
            paddingLeft: { xs: '16px', sm: isMobile ? '16px' : '16px' }, // Adjusted in CSS
            paddingRight: '16px',
            paddingBottom: '32px',
            minHeight: 'calc(100vh - 64px)',
            position: 'relative',
            zIndex: 1,
            backgroundImage: `
              radial-gradient(circle at 15% 50%, var(--color-primary-100), transparent 25%),
              radial-gradient(circle at 85% 30%, var(--color-secondary-100), transparent 25%),
              radial-gradient(circle at 75% 80%, var(--color-primary-200), transparent 25%)
            `,
            backgroundSize: '100% 100%',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            overflowX: 'hidden'
          }}
        >
          <Container 
            maxWidth="xl"
            sx={{ 
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'relative'
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 