import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Divider,
  useTheme as useMuiTheme
} from '@mui/material';
import { useMood } from '../../context/MoodContext';
import { useTheme, normalizeMoodType } from '../../context/ThemeContext';
import { MoodType, TimeOfDay } from '../../types';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import InsightsIcon from '@mui/icons-material/Insights';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AcUnitIcon from '@mui/icons-material/AcUnit';

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
      id={`mood-analytics-tabpanel-${index}`}
      aria-labelledby={`mood-analytics-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const MoodAnalytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { moodEntries, moodStats } = useMood();
  const { moodColors } = useTheme();
  const muiTheme = useMuiTheme();
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  if (!moodStats) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" align="center" sx={{ py: 5 }}>
          Not enough data to show analytics. Start logging your moods!
        </Typography>
      </Paper>
    );
  }
  
  // Convert mood stats to chart data
  const moodCountData = Object.entries(moodStats.moodCountByType).map(([mood, count]) => ({
    name: mood,
    value: count,
  }));
  
  const timeOfDayData = Object.entries(moodStats.averageMoodByTimeOfDay).map(([time, value]) => ({
    name: time === 'full-day' ? 'Full Day' : 
          time === 'morning' ? 'Morning' : 
          time === 'afternoon' ? 'Afternoon' : 
          time === 'evening' ? 'Evening' : 'Night',
    value: value,
  }));
  
  const dayOfWeekData = Object.entries(moodStats.averageMoodByDay).map(([day, value]) => ({
    name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
    value: value,
  }));
  
  // Weather correlation data
  const weatherData = moodStats.moodCorrelations.weather?.condition ? 
    Object.entries(moodStats.moodCorrelations.weather.condition).map(([condition, value]) => ({
      name: condition,
      value: value,
    })) : [];
  
  // Trend icon based on mood trend
  const getTrendIcon = () => {
    switch (moodStats.moodTrend) {
      case 'improving':
        return <TrendingUpIcon sx={{ color: 'var(--color-success)', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }} />;
      case 'declining':
        return <TrendingDownIcon sx={{ color: 'var(--color-error)', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }} />;
      case 'stable':
        return <TrendingFlatIcon sx={{ color: 'var(--color-primary)', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }} />;
    }
  };
  
  // Convert mood value to label
  const getMoodLabel = (value: number): string => {
    const rounded = Math.round(value);
    switch (rounded) {
      case 0: return 'Very Bad';
      case 1: return 'Bad';
      case 2: return 'Okay';
      case 3: return 'Good';
      case 4: return 'Very Good';
      default: return 'Okay';
    }
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'var(--surface-glass-light-solid)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(255, 255, 255, 0.7)'
      }}
    >
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            color: 'var(--color-text-dark)', 
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          Mood Analytics
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab 
            icon={<InsightsIcon />} 
            label="Overview" 
            sx={{ 
              color: tabValue === 0 ? 'var(--color-primary)' : 'var(--color-text-dark-secondary)',
              '&.Mui-selected': {
                color: 'var(--color-primary)'
              }
            }}
          />
          <Tab 
            icon={<TimelineIcon />} 
            label="Trends" 
            sx={{ 
              color: tabValue === 1 ? 'var(--color-primary)' : 'var(--color-text-dark-secondary)',
              '&.Mui-selected': {
                color: 'var(--color-primary)'
              }
            }}
          />
          <Tab 
            icon={<PieChartIcon />} 
            label="Distribution" 
            sx={{ 
              color: tabValue === 2 ? 'var(--color-primary)' : 'var(--color-text-dark-secondary)',
              '&.Mui-selected': {
                color: 'var(--color-primary)'
              }
            }}
          />
          <Tab 
            icon={<BubbleChartIcon />} 
            label="Correlations" 
            sx={{ 
              color: tabValue === 3 ? 'var(--color-primary)' : 'var(--color-text-dark-secondary)',
              '&.Mui-selected': {
                color: 'var(--color-primary)'
              }
            }}
          />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: 'var(--color-primary)',
                  borderRadius: '4px 0 0 4px'
                }}
              />
              <CardContent>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: 'var(--color-text-dark-secondary)',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Most Frequent Mood
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    className="mood-icon-wrapper"
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%', 
                      background: 'white',
                      boxShadow: 'var(--shadow-sm)',
                      mr: 1.5,
                      border: `1px solid ${moodColors[normalizeMoodType(moodStats.mostFrequentMood)]}`
                    }} 
                  >
                    <Box 
                      sx={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: '50%', 
                        bgcolor: moodColors[normalizeMoodType(moodStats.mostFrequentMood)],
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    sx={{ 
                      color: moodColors[normalizeMoodType(moodStats.mostFrequentMood)],
                      textShadow: '0 1px 1px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {moodStats.mostFrequentMood}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: moodStats.moodTrend === 'improving' 
                    ? 'var(--color-success)'
                    : moodStats.moodTrend === 'declining'
                      ? 'var(--color-error)'
                      : 'var(--color-primary)',
                  borderRadius: '4px 0 0 4px'
                }}
              />
              <CardContent>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: 'var(--color-text-dark-secondary)',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Mood Trend
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    className="icon-container"
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%', 
                      background: 'white',
                      boxShadow: 'var(--shadow-sm)',
                      mr: 1.5
                    }}
                  >
                    {getTrendIcon()}
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ 
                      ml: 0.5, 
                      textTransform: 'capitalize',
                      color: moodStats.moodTrend === 'improving' 
                        ? 'var(--color-success)'
                        : moodStats.moodTrend === 'declining'
                          ? 'var(--color-error)'
                          : 'var(--color-primary)',
                      textShadow: '0 1px 1px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {moodStats.moodTrend}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: 'var(--color-secondary)',
                  borderRadius: '4px 0 0 4px'
                }}
              />
              <CardContent>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: 'var(--color-text-dark-secondary)',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Best Day of Week
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    color: 'var(--color-secondary-dark)',
                    textShadow: '0 1px 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {dayOfWeekData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: 'var(--color-secondary)',
                  borderRadius: '4px 0 0 4px'
                }}
              />
              <CardContent>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: 'var(--color-text-dark-secondary)',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Best Time of Day
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    color: 'var(--color-secondary-dark)',
                    textShadow: '0 1px 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {timeOfDayData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Mood Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: 'var(--color-primary)',
                  borderRadius: '4px 0 0 4px'
                }}
              />
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: 'var(--color-text-dark)',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Mood Distribution
                </Typography>
                <Box 
                  sx={{ 
                    height: 300,
                    p: 1,
                    '& text': { fill: 'var(--color-text-dark)' }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moodCountData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {moodCountData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={moodColors[normalizeMoodType(entry.name)]} 
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value, 'Count']}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-md)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Average Mood by Day of Week */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: 'var(--color-secondary)',
                  borderRadius: '4px 0 0 4px'
                }}
              />
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: 'var(--color-text-dark)',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Average Mood by Day of Week
                </Typography>
                <Box 
                  sx={{ 
                    height: 300,
                    p: 1,
                    '& text': { fill: 'var(--color-text-dark)' },
                    '& .recharts-cartesian-grid-horizontal line, & .recharts-cartesian-grid-vertical line': {
                      stroke: 'rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'var(--color-text-dark)' }}
                      />
                      <YAxis 
                        domain={[0, 4]} 
                        tickFormatter={(value) => getMoodLabel(value)}
                        tick={{ fill: 'var(--color-text-dark)' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [getMoodLabel(value), 'Average Mood']}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-md)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#dayColorGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="dayColorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" />
                          <stop offset="100%" stopColor="var(--color-secondary)" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Trends Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Time of Day Radar Chart */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mood by Time of Day
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={timeOfDayData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis domain={[0, 4]} tickFormatter={(value) => getMoodLabel(value)} />
                      <Radar
                        name="Average Mood"
                        dataKey="value"
                        stroke={muiTheme.palette.primary.main}
                        fill={muiTheme.palette.primary.main}
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value) => [getMoodLabel(value as number), 'Average Mood']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Weather Correlation Chart */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mood by Weather Condition
                </Typography>
                {weatherData.length > 0 ? (
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weatherData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 4]} tickFormatter={(value) => getMoodLabel(value)} />
                        <Tooltip formatter={(value) => [getMoodLabel(value as number), 'Average Mood']} />
                        <Bar dataKey="value">
                          {weatherData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name.includes('Sun') || entry.name.includes('Clear') ? 
                                '#FFB74D' : entry.name.includes('Rain') ? 
                                '#64B5F6' : entry.name.includes('Cloud') ? 
                                '#90A4AE' : entry.name.includes('Snow') ? 
                                '#E1F5FE' : muiTheme.palette.primary.main} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                    <Typography variant="body1" color="text.secondary">
                      Not enough weather data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Temperature Correlation */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weather Impact on Mood
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <WbSunnyIcon sx={{ fontSize: 48, color: '#FFB74D' }} />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Temperature Correlation
                    </Typography>
                    <Typography variant="body1">
                      {moodStats.moodCorrelations.weather?.temperature ? 
                        `${(moodStats.moodCorrelations.weather.temperature * 100).toFixed(0)}%` : 
                        'No data'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {moodStats.moodCorrelations.weather?.temperature && 
                        moodStats.moodCorrelations.weather.temperature > 0 ? 
                        'Higher temperatures tend to improve your mood' : 
                        moodStats.moodCorrelations.weather?.temperature && 
                        moodStats.moodCorrelations.weather.temperature < 0 ? 
                        'Lower temperatures tend to improve your mood' : 
                        'No significant correlation with temperature'}
                    </Typography>
                  </Box>
                  
                  <Divider orientation="vertical" flexItem />
                  
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <AcUnitIcon sx={{ fontSize: 48, color: '#64B5F6' }} />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Best Weather for Your Mood
                    </Typography>
                    <Typography variant="body1">
                      {weatherData.length > 0 ? 
                        weatherData.sort((a, b) => b.value - a.value)[0]?.name : 
                        'No data'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {weatherData.length > 0 ? 
                        `You tend to feel better on ${weatherData.sort((a, b) => b.value - a.value)[0]?.name} days` : 
                        'Not enough weather data to determine patterns'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Distribution Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* Mood Count Bar Chart */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mood Entry Counts
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodCountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
                      <Bar dataKey="value">
                        {moodCountData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={moodColors[normalizeMoodType(entry.name as MoodType)]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Time of Day Distribution */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Time of Day Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeOfDayData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {timeOfDayData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === 'Morning' ? '#FFB74D' : 
                                  entry.name === 'Afternoon' ? '#FFA726' : 
                                  entry.name === 'Evening' ? '#FF7043' : 
                                  entry.name === 'Night' ? '#5C6BC0' : 
                                  '#9575CD'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [getMoodLabel(value as number), 'Average Mood']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Day of Week Distribution */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Day of Week Comparison
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dayOfWeekData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis domain={[0, 4]} tickFormatter={(value) => getMoodLabel(value)} />
                      <Radar
                        name="Average Mood"
                        dataKey="value"
                        stroke={muiTheme.palette.secondary.main}
                        fill={muiTheme.palette.secondary.main}
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value) => [getMoodLabel(value as number), 'Average Mood']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Correlations Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {/* Weather Correlation */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weather & Mood Correlation
                </Typography>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" paragraph>
                    Temperature Correlation: {moodStats.moodCorrelations.weather?.temperature ? 
                      `${(moodStats.moodCorrelations.weather.temperature * 100).toFixed(0)}%` : 
                      'No data'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {moodStats.moodCorrelations.weather?.temperature && 
                      moodStats.moodCorrelations.weather.temperature > 0.3 ? 
                      'Strong positive correlation: Your mood tends to improve significantly in warmer weather.' : 
                      moodStats.moodCorrelations.weather?.temperature && 
                      moodStats.moodCorrelations.weather.temperature > 0 ? 
                      'Slight positive correlation: Your mood tends to be somewhat better in warmer weather.' : 
                      moodStats.moodCorrelations.weather?.temperature && 
                      moodStats.moodCorrelations.weather.temperature < -0.3 ? 
                      'Strong negative correlation: Your mood tends to improve significantly in cooler weather.' : 
                      moodStats.moodCorrelations.weather?.temperature && 
                      moodStats.moodCorrelations.weather.temperature < 0 ? 
                      'Slight negative correlation: Your mood tends to be somewhat better in cooler weather.' : 
                      'No significant correlation between temperature and your mood.'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" gutterBottom>
                    Weather Condition Impact:
                  </Typography>
                  {weatherData.length > 0 ? (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weatherData.sort((a, b) => b.value - a.value)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 4]} tickFormatter={(value) => getMoodLabel(value)} />
                          <Tooltip formatter={(value) => [getMoodLabel(value as number), 'Average Mood']} />
                          <Bar dataKey="value">
                            {weatherData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.name.includes('Sun') || entry.name.includes('Clear') ? 
                                  '#FFB74D' : entry.name.includes('Rain') ? 
                                  '#64B5F6' : entry.name.includes('Cloud') ? 
                                  '#90A4AE' : entry.name.includes('Snow') ? 
                                  '#E1F5FE' : muiTheme.palette.primary.main} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not enough weather data available to determine correlations.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Day of Week Correlation */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Day of Week & Mood Patterns
                </Typography>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" paragraph>
                    Your mood tends to be highest on: {dayOfWeekData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Your mood tends to be lowest on: {dayOfWeekData.sort((a, b) => a.value - b.value)[0]?.name || 'N/A'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {dayOfWeekData.length > 0 ? 
                      `There's a ${Math.abs(dayOfWeekData.sort((a, b) => b.value - a.value)[0]?.value - 
                      dayOfWeekData.sort((a, b) => a.value - b.value)[0]?.value).toFixed(2)} point difference between your best and worst days.` : 
                      'Not enough data to determine day of week patterns.'}
                  </Typography>
                  
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dayOfWeekData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 4]} tickFormatter={(value) => getMoodLabel(value)} />
                        <Tooltip formatter={(value) => [getMoodLabel(value as number), 'Average Mood']} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={muiTheme.palette.primary.main} 
                          strokeWidth={2}
                          dot={{ fill: muiTheme.palette.primary.main, r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Paper>
  );
};

export default MoodAnalytics; 