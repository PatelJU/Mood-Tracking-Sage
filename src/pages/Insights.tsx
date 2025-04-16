import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  useTheme, 
  alpha,
  Divider
} from '@mui/material';
import PersonalizedInsights from '../components/charts/PersonalizedInsights';
import PredictiveTrendAnalysis from '../components/charts/PredictiveTrendAnalysis';
import MoodFlowSankey from '../components/charts/MoodFlowSankey';
import SentimentAnalysis from '../components/charts/SentimentAnalysis';
import CorrelationAnalysis from '../components/charts/CorrelationAnalysis';
import { useMood } from '../context/MoodContext';

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
      id={`insights-tabpanel-${index}`}
      aria-labelledby={`insights-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Insights: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const { moodEntries } = useMood();
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const getAverageMood = () => {
    if (moodEntries.length === 0) return 0;
    
    const moodValues = {
      'veryBad': 0,
      'bad': 1,
      'neutral': 2,
      'good': 3,
      'veryGood': 4
    };
    
    const mapMood = (mood: string): keyof typeof moodValues => {
      const map: Record<string, keyof typeof moodValues> = {
        'Very Bad': 'veryBad',
        'Bad': 'bad',
        'Okay': 'neutral',
        'Good': 'good',
        'Very Good': 'veryGood'
      };
      return map[mood] || 'neutral';
    };
    
    const total = moodEntries.reduce((sum, entry) => {
      return sum + moodValues[mapMood(entry.mood)];
    }, 0);
    
    return (total / moodEntries.length).toFixed(1);
  };
  
  const getMoodDistribution = () => {
    const distribution = {
      'veryBad': 0,
      'bad': 0,
      'neutral': 0,
      'good': 0,
      'veryGood': 0
    };
    
    const mapMood = (mood: string): keyof typeof distribution => {
      const map: Record<string, keyof typeof distribution> = {
        'Very Bad': 'veryBad',
        'Bad': 'bad',
        'Okay': 'neutral',
        'Good': 'good',
        'Very Good': 'veryGood'
      };
      return map[mood] || 'neutral';
    };
    
    moodEntries.forEach(entry => {
      distribution[mapMood(entry.mood)]++;
    });
    
    return distribution;
  };
  
  const moodColors: { [key: string]: string } = {
    'veryBad': '#F44336',
    'bad': '#FF9800',
    'neutral': '#FFC107',
    'good': '#8BC34A',
    'veryGood': '#4CAF50'
  };
  
  const getMostCommonMood = () => {
    const distribution = getMoodDistribution();
    let mostCommon = 'neutral';
    let highestCount = 0;
    
    for (const [mood, count] of Object.entries(distribution)) {
      if (count > highestCount) {
        highestCount = count;
        mostCommon = mood;
      }
    }
    
    return {
      mood: mostCommon,
      count: highestCount
    };
  };
  
  const mostCommonMood = getMostCommonMood();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 1 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Mood Insights
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Discover patterns and trends in your mood data with advanced analytics
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card 
            elevation={2}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                AVERAGE MOOD
              </Typography>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {getAverageMood()} / 4.0
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: moodColors[mostCommonMood.mood],
                    mr: 1
                  }}
                />
                <Typography variant="body2">
                  Most common: {mostCommonMood.mood.replace(/([A-Z])/g, ' $1').trim()} ({mostCommonMood.count} entries)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            elevation={2}
            sx={{ 
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                TOTAL MOOD ENTRIES
              </Typography>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {moodEntries.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tracking your moods since {moodEntries.length > 0 ? new Date(moodEntries.reduce((a, b) => 
                  new Date(a.date) < new Date(b.date) ? a : b
                ).date).toLocaleDateString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            elevation={2}
            sx={{ 
              bgcolor: alpha(theme.palette.info.main, 0.1),
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                MOOD DISTRIBUTION
              </Typography>
              <Box sx={{ display: 'flex', mt: 1, mb: 1 }}>
                {Object.entries(getMoodDistribution()).map(([mood, count]) => (
                  <Box 
                    key={mood}
                    sx={{
                      height: 40,
                      flexGrow: count / moodEntries.length || 0.05,
                      bgcolor: moodColors[mood],
                      mx: 0.2,
                      borderRadius: 1
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Very Bad</Typography>
                <Typography variant="caption">Very Good</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="insights tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Insights" id="insights-tab-0" aria-controls="insights-tabpanel-0" />
          <Tab label="Predictions" id="insights-tab-1" aria-controls="insights-tabpanel-1" />
          <Tab label="Mood Flow" id="insights-tab-2" aria-controls="insights-tabpanel-2" />
          <Tab label="Journal Analysis" id="insights-tab-3" aria-controls="insights-tabpanel-3" />
          <Tab label="Correlations" id="insights-tab-4" aria-controls="insights-tabpanel-4" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <PersonalizedInsights />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <PredictiveTrendAnalysis />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <MoodFlowSankey />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <SentimentAnalysis />
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <CorrelationAnalysis />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Insights; 