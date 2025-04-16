import React, { useState, useEffect } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Navigation from '../nav/Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  return (
    <Box className="app-container">
      <Header onMenuToggle={toggleDrawer} />
      <Navigation drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      
      <Box className="content-wrapper">
        <Box
          component="main"
          className="main-content"
          sx={{
            paddingTop: '100px', // Increased from 90px to 100px (80px header + 20px buffer)
            paddingLeft: { xs: '16px', sm: isMobile ? '16px' : '84px' }, // Sidebar width + buffer
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