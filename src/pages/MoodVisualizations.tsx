import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Fade,
  Button,
  Stack,
  Divider
} from '@mui/material';
import MoodDistributionDonut from '../components/charts/MoodDistributionDonut';
import MoodPatternMatch from '../components/charts/MoodPatternMatch';
import MoodFlowSankey from '../components/charts/MoodFlowSankey';
import MoodAnalytics from '../components/charts/MoodAnalytics';
import PersonalizedInsights from '../components/charts/PersonalizedInsights';
import SentimentAnalysis from '../components/charts/SentimentAnalysis';
import { useAuth } from '../context/AuthContext';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`visualization-tabpanel-${index}`}
      aria-labelledby={`visualization-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          <Fade in={value === index} timeout={500}>
            <div>{children}</div>
          </Fade>
        </Box>
      )}
    </div>
  );
};

const MoodVisualizations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 1,
            fontSize: { xs: '1.75rem', md: '2.125rem' }
          }}
        >
          Mood Visualizations
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: '800px' }}
        >
          Explore your emotional patterns through interactive visualizations. Gain insights into your mood trends, correlations, and patterns over time.
        </Typography>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 8px rgba(0, 0, 0, 0.02)'
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ 
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              backgroundColor: '#4361ee',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab 
            icon={<ViewQuiltIcon />} 
            label="Dashboard" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              py: 2,
              '&.Mui-selected': {
                color: '#4361ee'
              }
            }} 
          />
          <Tab 
            icon={<TimelineIcon />} 
            label="Mood Flow" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              py: 2,
              '&.Mui-selected': {
                color: '#4361ee'
              }
            }} 
          />
          <Tab 
            icon={<BubbleChartIcon />} 
            label="Analytics" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              py: 2,
              '&.Mui-selected': {
                color: '#4361ee'
              }
            }} 
          />
          <Tab 
            icon={<TipsAndUpdatesIcon />} 
            label="Insights" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              py: 2,
              '&.Mui-selected': {
                color: '#4361ee'
              }
            }} 
          />
        </Tabs>
        
        {/* Dashboard View */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Donut Chart - Mood Distribution */}
            <Grid item xs={12} md={6} lg={4}>
              <MoodDistributionDonut />
            </Grid>
            
            {/* Pattern Match - Mood Patterns */}
            <Grid item xs={12} md={6} lg={8}>
              <MoodPatternMatch />
            </Grid>
            
            {/* Sentiment Analysis */}
            <Grid item xs={12} md={6}>
              <SentimentAnalysis />
            </Grid>
            
            {/* Personalized Insights */}
            <Grid item xs={12} md={6}>
              <PersonalizedInsights />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Mood Flow View */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
            <MoodFlowSankey />
          </Box>
        </TabPanel>
        
        {/* Analytics View */}
        <TabPanel value={activeTab} index={2}>
          <MoodAnalytics />
        </TabPanel>
        
        {/* Insights View */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <PersonalizedInsights />
            </Grid>
            <Grid item xs={12} md={6}>
              <SentimentAnalysis />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      <Box 
        component="div"
        sx={{ 
          textAlign: 'center',
          p: 3,
          mt: 2,
          borderRadius: '16px',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(67, 97, 238, 0.1)',
          maxWidth: '800px',
          mx: 'auto',
          animation: 'fadeIn 0.5s ease-in-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
          Understanding Your Visualizations
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={2} sx={{ textAlign: 'left' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Mood Distribution:</strong> Shows the breakdown of your mood entries, giving you a clear picture of your emotional balance.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Pattern Analysis:</strong> Identifies recurring patterns in your mood entries, helping you understand what factors influence your emotions.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Mood Flow:</strong> Visualizes how your moods transition and connect over time, revealing your emotional journey.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Analytics:</strong> Provides detailed statistics and trends about your mood data for deeper insights.
          </Typography>
        </Stack>
        <Button 
          variant="outlined"
          size="small"
          sx={{ 
            mt: 3,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 3
          }}
        >
          Learn More About Data Insights
        </Button>
      </Box>
    </Container>
  );
};

export default MoodVisualizations; 