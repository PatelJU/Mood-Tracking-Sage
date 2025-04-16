import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { CssBaseline, Box, Fab } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './App.css';
import AddIcon from '@mui/icons-material/Add';

// Import from the correct paths
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import { UserProvider } from './context/UserContext';
import { SettingsProvider } from './context/SettingsContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MoodLogger from './components/mood/MoodLogger';
import MoodCalendar from './components/mood/MoodCalendar';
import MoodAnalytics from './components/charts/MoodAnalytics';
import MoodHistory from './components/history/MoodHistory';
import RewardsSystem from './components/rewards/RewardsSystem';
import ThemePage from './components/themes/ThemePage';
import UserProfile from './components/profile/UserProfile';
import NotificationCenter from './components/notifications/NotificationCenter';
import Settings from './pages/Settings';
import Mindfulness from './components/mindfulness/Mindfulness';
import Insights from './pages/Insights';
import MoodVisualizations from './pages/MoodVisualizations';
import MoodEntry from './pages/MoodEntry';
import MoodJournal from './pages/MoodJournal';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // In a real app, you would check if the user is authenticated
  // For now, we'll assume they are
  const isAuthenticated = true;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const WrappedUserProfile = () => (
  <UserProvider>
    <UserProfile />
  </UserProvider>
);

const AppContent: React.FC = () => {
  // Use the theme from ThemeContext to properly apply themes
  return (
    <>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh', 
          width: '100%'
        }}>
          <Layout>
            <Fab
              color="primary"
              aria-label="log mood"
              component={RouterLink}
              to="/mood-entry"
              sx={{
                position: 'fixed',
                bottom: { xs: 24, sm: 32, md: 40 },
                right: { xs: 24, sm: 32, md: 40 },
                zIndex: 1250,
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                transition: 'all var(--motion-elastic)',
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.05)',
                  boxShadow: '0 5px 20px rgba(99, 102, 241, 0.8)'
                },
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: '1.8rem', sm: '2rem' },
                  color: 'white'
                }
              }}
            >
              <AddIcon />
            </Fab>
            
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/mood-entry" element={
                <ProtectedRoute>
                  <MoodEntry />
                </ProtectedRoute>
              } />
              <Route path="/mood-entry/:dateParam" element={
                <ProtectedRoute>
                  <MoodEntry />
                </ProtectedRoute>
              } />
              <Route path="/journal" element={
                <ProtectedRoute>
                  <MoodJournal />
                </ProtectedRoute>
              } />
              <Route path="/journal/:dateParam" element={
                <ProtectedRoute>
                  <MoodJournal />
                </ProtectedRoute>
              } />
              <Route path="/log" element={
                <ProtectedRoute>
                  <Navigate to="/mood-entry" replace />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <MoodHistory />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <MoodAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/visualizations" element={
                <ProtectedRoute>
                  <MoodVisualizations />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <MoodCalendar />
                </ProtectedRoute>
              } />
              <Route path="/rewards" element={
                <ProtectedRoute>
                  <RewardsSystem />
                </ProtectedRoute>
              } />
              <Route path="/themes" element={
                <ProtectedRoute>
                  <ThemePage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <WrappedUserProfile />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationCenter />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/insights" element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              } />
              <Route path="/mindfulness" element={
                <ProtectedRoute>
                  <Mindfulness />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </Box>
      </Router>
    </>
  );
};

const App: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
        <UserProvider>
          <MoodProvider>
            <SettingsProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </SettingsProvider>
          </MoodProvider>
        </UserProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
};

export default App;
