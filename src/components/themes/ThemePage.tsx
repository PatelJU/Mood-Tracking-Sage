import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Tab, Tabs } from '@mui/material';
import { Palette as PaletteIcon, ColorLens as ColorLensIcon } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `theme-tab-${index}`,
    'aria-controls': `theme-tabpanel-${index}`,
  };
};

const ThemePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Theme settings tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<PaletteIcon />} 
              label="Theme Library" 
              {...a11yProps(0)} 
              sx={{ py: 2 }}
            />
            <Tab 
              icon={<ColorLensIcon />} 
              label="Create Custom Theme" 
              {...a11yProps(1)} 
              sx={{ py: 2 }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5">Theme Library</Typography>
          <Typography paragraph>
            Theme library functionality is currently being developed. 
            Check back soon for the ability to select and customize themes.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Create Your Custom Theme
            </Typography>
            <Typography variant="body1" paragraph>
              Custom theme creation functionality is coming soon. 
              You'll be able to design your own theme by selecting colors 
              for different elements of the application.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ThemePage; 