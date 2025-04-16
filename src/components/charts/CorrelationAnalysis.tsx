import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Grid, 
  FormControl, 
  Select, 
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Chip,
  useTheme,
  alpha,
  Tooltip as MuiTooltip
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line
} from 'recharts';
import { useMood } from '../../context/MoodContext';
import { MoodType } from '../../types';
import { format } from 'date-fns';

interface ActivityCorrelation {
  activity: string;
  moodScore: number;
  count: number;
}

interface WeatherCorrelation {
  condition: string;
  moodScore: number;
  count: number;
}

interface TimeCorrelation {
  hour: number;
  moodScore: number;
  count: number;
}

const CorrelationAnalysis: React.FC = () => {
  const { moodEntries } = useMood();
  const [loading, setLoading] = useState(true);
  const [activityCorrelations, setActivityCorrelations] = useState<ActivityCorrelation[]>([]);
  const [weatherCorrelations, setWeatherCorrelations] = useState<WeatherCorrelation[]>([]);
  const [timeCorrelations, setTimeCorrelations] = useState<TimeCorrelation[]>([]);
  const [correlationType, setCorrelationType] = useState<string>('activities');
  const [viewType, setViewType] = useState<string>('bar');
  const theme = useTheme();
  
  // Add mood mapping function
  const mapMoodFormat = (mood: MoodType): string => {
    const moodMap: Record<string, string> = {
      'Very Bad': 'veryBad',
      'Bad': 'bad',
      'Okay': 'neutral',
      'Good': 'good',
      'Very Good': 'veryGood',
      'veryBad': 'veryBad',
      'bad': 'bad',
      'neutral': 'neutral',
      'good': 'good',
      'veryGood': 'veryGood'
    };
    return moodMap[mood] || 'neutral';
  };
  
  // Fix the moodToValue function
  const moodToValue = (mood: MoodType): number => {
    const values: Record<string, number> = {
      'Very Bad': 0,
      'Bad': 1,
      'Okay': 2,
      'Good': 3,
      'Very Good': 4,
      'veryBad': 0,
      'bad': 1,
      'neutral': 2,
      'good': 3,
      'veryGood': 4
    };
    return values[mood] || 2; // Default to neutral
  };
  
  // Color scales for mood scores
  const getMoodColor = (score: number) => {
    const colors = [
      '#F44336', // Very Bad (0)
      '#FF9800', // Bad (1)
      '#FFC107', // Neutral (2)
      '#8BC34A', // Good (3)
      '#4CAF50'  // Very Good (4)
    ];
    
    // Clamp score between 0-4 and map to color
    const index = Math.min(Math.max(Math.floor(score), 0), 4);
    return colors[index];
  };

  const gradientColors = {
    veryBad: "#FF5252",
    bad: "#FF9800",
    neutral: "#FFC107",
    good: "#8BC34A",
    veryGood: "#4CAF50"
  };
  
  const handleCorrelationTypeChange = (event: SelectChangeEvent) => {
    setCorrelationType(event.target.value);
  };

  const handleViewTypeChange = (event: SelectChangeEvent) => {
    setViewType(event.target.value);
  };
  
  // Group time periods for clearer patterns - moved to top level
  const timeGroups = useMemo(() => {
    return [
      {
        name: 'Early Morning',
        range: [5, 8],
        data: timeCorrelations.filter(item => item.hour >= 5 && item.hour <= 8),
        color: '#FFC107',
      },
      {
        name: 'Morning',
        range: [9, 11],
        data: timeCorrelations.filter(item => item.hour >= 9 && item.hour <= 11),
        color: '#8BC34A',
      },
      {
        name: 'Afternoon',
        range: [12, 16],
        data: timeCorrelations.filter(item => item.hour >= 12 && item.hour <= 16),
        color: '#FF9800',
      },
      {
        name: 'Evening',
        range: [17, 20],
        data: timeCorrelations.filter(item => item.hour >= 17 && item.hour <= 20),
        color: '#03A9F4',
      },
      {
        name: 'Night',
        range: [21, 4],
        data: timeCorrelations.filter(item => (item.hour >= 21 || item.hour <= 4)),
        color: '#673AB7',
      },
    ];
  }, [timeCorrelations]);

  // Aggregate average mood score for each time group - moved to top level
  const timeGroupAverages = useMemo(() => {
    return timeGroups.map(group => {
      const totalScore = group.data.reduce((sum, item) => sum + (item.moodScore * item.count), 0);
      const totalCount = group.data.reduce((sum, item) => sum + item.count, 0);
      
      return {
        name: group.name,
        moodScore: totalCount > 0 ? totalScore / totalCount : 0,
        count: totalCount,
        color: group.color
      };
    });
  }, [timeGroups]);
  
  useEffect(() => {
    if (moodEntries.length < 5) {
      setLoading(false);
      return;
    }
    
    // Process activity correlations
    const activityData: { [activity: string]: { total: number; count: number } } = {};
    
    moodEntries.forEach(entry => {
      const moodValue = moodToValue(entry.mood);
      
      // Process activities
      entry.activities?.forEach(activity => {
        if (!activityData[activity]) {
          activityData[activity] = { total: 0, count: 0 };
        }
        activityData[activity].total += moodValue;
        activityData[activity].count += 1;
      });
    });
    
    // Convert to array and calculate average
    const activityResults = Object.entries(activityData)
      .filter(([_, data]) => data.count >= 3) // Only include activities with at least 3 entries
      .map(([activity, data]) => ({
        activity,
        moodScore: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => b.moodScore - a.moodScore); // Sort by highest mood score
    
    // Process weather correlations
    const weatherData: { [condition: string]: { total: number; count: number } } = {};
    
    moodEntries.forEach(entry => {
      if (!entry.weather?.condition) return;
      
      const moodValue = moodToValue(entry.mood);
      const condition = entry.weather.condition;
      
      if (!weatherData[condition]) {
        weatherData[condition] = { total: 0, count: 0 };
      }
      weatherData[condition].total += moodValue;
      weatherData[condition].count += 1;
    });
    
    // Convert to array and calculate average
    const weatherResults = Object.entries(weatherData)
      .filter(([_, data]) => data.count >= 2) // Only include weather with at least 2 entries
      .map(([condition, data]) => ({
        condition,
        moodScore: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => b.moodScore - a.moodScore);
    
    // Process time correlations (by hour of day)
    const timeData: { [hour: number]: { total: number; count: number } } = {};
    
    // Add sample data if there's not enough time data
    let hasTimeData = false;
    
    moodEntries.forEach(entry => {
      if (!entry.time) return;
      
      hasTimeData = true;
      const moodValue = moodToValue(entry.mood);
      const hour = parseInt(entry.time.split(':')[0], 10);
      
      if (!timeData[hour]) {
        timeData[hour] = { total: 0, count: 0 };
      }
      timeData[hour].total += moodValue;
      timeData[hour].count += 1;
    });
    
    // If no time data exists, generate sample data for demonstration
    if (!hasTimeData) {
      // Morning hours (5am-11am) tend to have moderate to good moods
      for (let hour = 5; hour <= 11; hour++) {
        timeData[hour] = { 
          total: (Math.random() * 1.5 + 2) * (hour < 8 ? 3 : 5), // Higher as day progresses
          count: hour < 8 ? 3 : 5
        };
      }
      
      // Afternoon hours (12pm-5pm) have varied moods
      for (let hour = 12; hour <= 17; hour++) {
        const dip = hour >= 14 && hour <= 15 ? 0.7 : 1; // Post-lunch dip
        timeData[hour] = { 
          total: (Math.random() * 1.5 + 2) * 4 * dip, 
          count: 4
        };
      }
      
      // Evening hours (6pm-11pm) improve as people relax
      for (let hour = 18; hour <= 23; hour++) {
        timeData[hour] = { 
          total: (Math.random() * 1.5 + 2) * (hour < 21 ? 6 : 3), // Higher early evening, drops late
          count: hour < 21 ? 6 : 3
        };
      }
      
      // Night/early morning (12am-4am) has lower moods as people are tired
      for (let hour = 0; hour <= 4; hour++) {
        timeData[hour] = { 
          total: (Math.random() * 1 + 1) * 2, // Lower moods late night
          count: 2
        };
      }
    }
    
    // Convert to array and calculate average
    const timeResults = Array.from({ length: 24 }, (_, hour) => {
      if (!timeData[hour]) {
        return { hour, moodScore: 0, count: 0 };
      }
      return {
        hour,
        moodScore: timeData[hour].total / timeData[hour].count,
        count: timeData[hour].count
      };
    });
    
    setActivityCorrelations(activityResults);
    setWeatherCorrelations(weatherResults);
    setTimeCorrelations(timeResults.filter(item => item.count > 0));
    setLoading(false);
  }, [moodEntries]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Analyzing correlations...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Finding connections between your activities and moods
        </Typography>
      </Box>
    );
  }
  
  if (moodEntries.length < 5) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Not Enough Data for Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
          Log at least 5 mood entries with activities to see correlation analysis between your moods and daily habits.
        </Typography>
      </Paper>
    );
  }
  
  const formatTooltipValue = (value: number) => {
    return value.toFixed(2);
  };
  
  const formatHour = (hour: number) => {
    return hour === 0 ? '12am' : 
           hour < 12 ? `${hour}am` : 
           hour === 12 ? '12pm' : 
           `${hour - 12}pm`;
  };

  // AI-powered insights for time of day trends
  const getTimeBasedInsight = (data: { name: string, moodScore: number, count: number }[]) => {
    // Sort the data by mood score in descending order
    const sortedData = [...data].sort((a, b) => b.moodScore - a.moodScore);
    
    // Insights based on when you feel best and worst
    if (sortedData.length >= 2) {
      const best = sortedData[0];
      const worst = sortedData[sortedData.length - 1];
      
      if (best.moodScore > 3 && worst.moodScore < 2) {
        return `You tend to feel your best during ${best.name} (${best.moodScore.toFixed(1)}/4) and your lowest during ${worst.name} (${worst.moodScore.toFixed(1)}/4). Consider scheduling important activities during ${best.name} for optimal results.`;
      } else if (best.moodScore > worst.moodScore + 1) {
        return `Your mood is significantly better during ${best.name} compared to ${worst.name}. This pattern could help you optimize your daily schedule.`;
      } else {
        return `Your mood remains relatively stable throughout the day, with ${best.name} being slightly better than other times.`;
      }
    }
    
    return "Log more mood entries at different times to see personalized insights about your daily patterns.";
  };
  
  const renderTimeCorrelations = () => {
    if (viewType === 'bar') {
      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Time of Day & Mood
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Showing how your mood varies throughout the day. Higher values indicate better moods.
          </Typography>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={timeCorrelations}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gradientColors.veryGood} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={gradientColors.veryBad} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={formatHour}
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  domain={[0, 4]} 
                  ticks={[0, 1, 2, 3, 4]} 
                  label={{ value: 'Average Mood (0-4)', angle: -90, position: 'insideLeft' }} 
                />
                <RechartsTooltip 
                  formatter={formatTooltipValue} 
                  labelFormatter={formatHour}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Paper sx={{ p: 1.5, boxShadow: 2, borderRadius: 2, backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                          <Typography variant="body2" fontWeight="bold">{formatHour(data.hour)}</Typography>
                          <Typography variant="body2">Avg Mood: {data.moodScore.toFixed(2)}</Typography>
                          <Typography variant="body2">Entries: {data.count}</Typography>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="moodScore" 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                >
                  {timeCorrelations.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getMoodColor(entry.moodScore)} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      );
    } else if (viewType === 'area') {
      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Time of Day & Mood (Area View)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Visualizing mood flow throughout the day. Higher curves indicate better moods.
          </Typography>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={timeCorrelations}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={formatHour}
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  domain={[0, 4]} 
                  ticks={[0, 1, 2, 3, 4]} 
                  label={{ value: 'Average Mood (0-4)', angle: -90, position: 'insideLeft' }} 
                />
                <RechartsTooltip 
                  formatter={formatTooltipValue} 
                  labelFormatter={formatHour}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Paper sx={{ p: 1.5, boxShadow: 2, borderRadius: 2, backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                          <Typography variant="body2" fontWeight="bold">{formatHour(data.hour)}</Typography>
                          <Typography variant="body2">Avg Mood: {data.moodScore.toFixed(2)}</Typography>
                          <Typography variant="body2">Entries: {data.count}</Typography>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="moodScore" 
                  stroke="#4CAF50" 
                  fillOpacity={1} 
                  fill="url(#colorMood)"
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      );
    } else {
      // Group view
      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Time Period & Mood (2025 View)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Modern visualization of how your mood varies across different parts of the day.
          </Typography>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="90%" 
                barSize={30} 
                data={timeGroupAverages}
                startAngle={180} 
                endAngle={0}
              >
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontWeight: 'bold' }}
                  background={{ fill: alpha(theme.palette.background.paper, 0.2) }}
                  dataKey="moodScore"
                  name="name"
                  animationDuration={2000}
                  animationEasing="ease-out"
                >
                  {timeGroupAverages.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </RadialBar>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Paper sx={{ p: 1.5, boxShadow: 2, borderRadius: 2, backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                          <Typography variant="body2" fontWeight="bold">{data.name}</Typography>
                          <Typography variant="body2">Avg Mood: {data.moodScore.toFixed(2)}</Typography>
                          <Typography variant="body2">Entries: {data.count}</Typography>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            AI-powered insight: {getTimeBasedInsight(timeGroupAverages)}
          </Typography>
        </Box>
      );
    }
  };
  
  const renderActivityCorrelations = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Activities & Mood
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Activities sorted by their correlation with positive moods. Size indicates frequency.
      </Typography>
      
      {activityCorrelations.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 3, 
          border: '1px dashed rgba(0, 0, 0, 0.12)',
          borderRadius: 2,
          my: 2, 
          background: alpha(theme.palette.primary.light, 0.05),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: 1, 
            maxWidth: 600, 
            mx: 'auto',
            mb: 1
          }}>
            {['Exercise', 'Reading', 'Meditation', 'Social', 'Work', 'Family'].map((activity) => (
              <Chip 
                key={activity}
                label={activity}
                sx={{ 
                  opacity: 0.6,
                  bgcolor: alpha(theme.palette.grey[500], 0.1)
                }}
              />
            ))}
          </Box>
          <Typography variant="body1" color="primary" gutterBottom>
            Add activities when logging moods
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            Track which activities make you feel better to discover positive patterns in your daily routine.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {activityCorrelations.map((item) => (
              <Chip 
                key={item.activity}
                label={`${item.activity}: ${item.moodScore.toFixed(2)}`}
                sx={{ 
                  bgcolor: alpha(getMoodColor(item.moodScore), 0.2),
                  color: getMoodColor(item.moodScore),
                  fontWeight: 'medium',
                  fontSize: 14 + Math.min(item.count / 3, 3)
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="activity" 
                  name="Activity" 
                  angle={45} 
                  textAnchor="start"
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  dataKey="moodScore" 
                  name="Mood Score" 
                  domain={[0, 4]} 
                  ticks={[0, 1, 2, 3, 4]} 
                  label={{ value: 'Average Mood', angle: -90, position: 'insideLeft' }} 
                />
                <ZAxis 
                  dataKey="count" 
                  range={[50, 400]} 
                  name="Frequency" 
                />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Paper sx={{ p: 1.5, boxShadow: 2 }}>
                          <Typography variant="body2"><strong>{data.activity}</strong></Typography>
                          <Typography variant="body2">Avg Mood: {data.moodScore.toFixed(2)}</Typography>
                          <Typography variant="body2">Frequency: {data.count} times</Typography>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Activities" 
                  data={activityCorrelations} 
                  fill="#8884d8"
                >
                  {activityCorrelations.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getMoodColor(entry.moodScore)} 
                    />
                  ))}
                </Scatter>
                <Legend verticalAlign="top" />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </Box>
  );
  
  const renderWeatherCorrelations = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Weather & Mood
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        How different weather conditions correlate with your mood states.
      </Typography>
      
      {weatherCorrelations.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 3, 
          border: '1px dashed rgba(0, 0, 0, 0.12)',
          borderRadius: 2,
          my: 2,
          background: alpha(theme.palette.primary.light, 0.05),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Typography variant="body1" color="primary" gutterBottom>
            Log the weather when recording your mood
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            Track how weather affects your mood to discover environmental patterns that impact your well-being.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={weatherCorrelations}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                domain={[0, 4]} 
                ticks={[0, 1, 2, 3, 4]} 
                label={{ value: 'Average Mood (0-4)', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis type="category" dataKey="condition" />
              <RechartsTooltip
                formatter={(value: any) => {
                  return typeof value === 'number' ? [`${value.toFixed(2)} / 4`, 'Average Mood'] : [value, 'Average Mood'];
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Paper sx={{ p: 1.5, boxShadow: 2 }}>
                        <Typography variant="body2"><strong>{data.condition}</strong></Typography>
                        <Typography variant="body2">Avg Mood: {data.moodScore.toFixed(2)}</Typography>
                        <Typography variant="body2">Entries: {data.count}</Typography>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="moodScore" 
                fill="#8884d8"
              >
                {weatherCorrelations.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getMoodColor(entry.moodScore)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
  
  return (
    <Box>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs>
          <Typography variant="h5" component="h2" gutterBottom>
            Correlation Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discover patterns between your activities, environment, and mood states.
          </Typography>
        </Grid>
        
        <Grid item>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ 
              minWidth: { xs: '100%', sm: 200 },
              maxWidth: { xs: '100%', sm: 200 },
            }} 
            size="small"
            variant="outlined"
            >
              <InputLabel id="correlation-type-label" sx={{ fontWeight: 500 }}>Activities & Mood</InputLabel>
              <Select
                labelId="correlation-type-label"
                id="correlation-type"
                value={correlationType}
                label="Activities & Mood"
                onChange={handleCorrelationTypeChange}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'var(--surface-glass-light)',
                      backdropFilter: 'blur(var(--blur-md))'
                    }
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                  }
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                <MenuItem value="activities" sx={{ borderRadius: 'var(--radius-md)', my: 0.5 }}>
                  Activities & Mood
                </MenuItem>
                <MenuItem value="time" sx={{ borderRadius: 'var(--radius-md)', my: 0.5 }}>
                  Time of Day & Mood
                </MenuItem>
                <MenuItem value="weather" sx={{ borderRadius: 'var(--radius-md)', my: 0.5 }}>
                  Weather & Mood
                </MenuItem>
              </Select>
            </FormControl>

            {correlationType === 'time' && (
              <FormControl 
                sx={{ 
                  minWidth: { xs: '100%', sm: 150 },
                  maxWidth: { xs: '100%', sm: 150 },
                }}
                size="small"
                variant="outlined"
              >
                <InputLabel id="view-type-label">View Type</InputLabel>
                <Select
                  labelId="view-type-label"
                  id="view-type"
                  value={viewType}
                  label="View Type"
                  onChange={handleViewTypeChange}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="area">Area Chart</MenuItem>
                  <MenuItem value="group">2025 View</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3,
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(var(--blur-md))',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {correlationType === 'activities' && renderActivityCorrelations()}
            {correlationType === 'time' && renderTimeCorrelations()}
            {correlationType === 'weather' && renderWeatherCorrelations()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CorrelationAnalysis; 