import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Grid, 
  Switch, 
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import PaletteIcon from '@mui/icons-material/Palette';
import InfoIcon from '@mui/icons-material/Info';
import ThemeSwitcher from '../components/themes/ThemeSwitcher';
import { useSettings } from '../context/SettingsContext';

interface SettingsProps {
  ambientEnabled?: boolean;
  onToggleAmbient?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  ambientEnabled = false, 
  onToggleAmbient = () => {} 
}) => {
  // Get settings and toggle function from context
  const { settings, toggleReduceAnimations, updateSettings } = useSettings();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Settings
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <List component="nav" aria-label="settings navigation">
                <ListItemButton selected>
                  <ListItemIcon>
                    <PaletteIcon />
                  </ListItemIcon>
                  <ListItemText primary="Appearance" />
                </ListItemButton>
                <ListItemButton>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItemButton>
                <ListItemButton>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Privacy & Security" />
                </ListItemButton>
                <ListItemButton>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText primary="About" />
                </ListItemButton>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                Appearance
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Customize the look and feel of your mood tracking application
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="themes-content"
                  id="themes-header"
                >
                  <Typography variant="h6">Theme Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Choose from our pre-designed themes or create your own custom theme
                  </Typography>
                  
                  <ThemeSwitcher variant="full" />
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="general-appearance-content"
                  id="general-appearance-header"
                >
                  <Typography variant="h6">General Appearance</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Enable ambient backgrounds" 
                        secondary="Show dynamic backgrounds that change with your mood"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={ambientEnabled}
                          onChange={onToggleAmbient}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Compact mode" 
                        secondary="Use a more compact layout for lists and cards"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={false}
                          onChange={() => updateSettings({ useHighContrastMode: !settings.useHighContrastMode })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Reduce animations" 
                        secondary="Disable animations for better performance and battery life"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={settings.reduceAnimations}
                          onChange={toggleReduceAnimations}
                          color="error"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Settings; 