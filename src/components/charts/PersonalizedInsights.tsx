import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Grid, 
  Button, 
  Divider,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  useTheme,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha
} from '@mui/material';
import { useMood } from '../../context/MoodContext';
import { MoodType } from '../../types';
import { generateInsights, PersonalizedInsight } from '../../services/insightService';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, AccessTime, CalendarToday, WbSunny, LocationOn, DirectionsRun, Bedtime, LocalActivity, BookmarkBorder } from '@mui/icons-material';
import SocialShare from '../utils/SocialShare';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

interface Insight {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: number; // 1 (highest) to 5 (lowest)
  date: Date;
  category: 'time' | 'activity' | 'location' | 'weather' | 'pattern';
  additionalInfo?: string;
}

const PersonalizedInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const { moodEntries } = useMood();
  const theme = useTheme();

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
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return theme.palette.error.main;
      case 2: return theme.palette.warning.main;
      case 3: return theme.palette.info.main;
      case 4: return theme.palette.success.main;
      case 5: return theme.palette.grey[500];
      default: return theme.palette.primary.main;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pattern':
        return <AccessTime />;
      case 'suggestion':
        return <AccessTime />;
      case 'warning':
        return <AccessTime />;
      case 'achievement':
        return <AccessTime />;
      case 'time':
        return <AccessTime />;
      case 'activity':
        return <DirectionsRun />;
      case 'location':
        return <LocationOn />;
      case 'weather':
        return <WbSunny />;
      default:
        return <AccessTime />;
    }
  };
  
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'pattern':
        return 'Pattern';
      case 'suggestion':
        return 'Suggestion';
      case 'warning':
        return 'Alert';
      case 'achievement':
        return 'Achievement';
      case 'time':
        return 'Time';
      case 'activity':
        return 'Activity';
      case 'location':
        return 'Location';
      case 'weather':
        return 'Weather';
      default:
        return 'Insight';
    }
  };

  const handleFeedback = (insightId: string, type: 'helpful' | 'not-helpful') => {
    // In a real app, you would send this feedback to your backend
    console.log(`User found insight ${insightId} ${type}`);
  };
  
  const handleShare = (insight: Insight) => {
    // This is now handled by the SocialShare component
  };

  useEffect(() => {
    if (moodEntries.length < 5) {
      setLoading(false);
      return;
    }
    
    // Sort entries by date
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Generate insights
    const generatedInsights: Insight[] = [];
    
    // Time of Day Patterns
    const timeOfDayInsights = analyzeTimeOfDayPatterns(sortedEntries);
    generatedInsights.push(...timeOfDayInsights);
    
    // Day of Week Patterns
    const dayOfWeekInsights = analyzeDayOfWeekPatterns(sortedEntries);
    generatedInsights.push(...dayOfWeekInsights);
    
    // Activity Correlations
    const activityInsights = analyzeActivityPatterns(sortedEntries);
    generatedInsights.push(...activityInsights);
    
    // Weather Patterns
    const weatherInsights = analyzeWeatherPatterns(sortedEntries);
    generatedInsights.push(...weatherInsights);
    
    // Consistency/Streak Patterns
    const streakInsights = analyzeStreakPatterns(sortedEntries);
    generatedInsights.push(...streakInsights);
    
    // Sort insights by priority (most important first)
    const sortedInsights = generatedInsights.sort((a, b) => {
      // First sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then by date (newest first)
      return b.date.getTime() - a.date.getTime();
    });
    
    setInsights(sortedInsights);
    setLoading(false);
  }, [moodEntries]);
  
  const analyzeTimeOfDayPatterns = (entries: typeof moodEntries) => {
    const timeInsights: Insight[] = [];
    
    // Group entries by time of day
    const morningEntries = entries.filter(entry => {
      const hour = entry.time ? parseInt(entry.time.split(':')[0], 10) : 0;
      return hour >= 5 && hour < 12;
    });
    
    const afternoonEntries = entries.filter(entry => {
      const hour = entry.time ? parseInt(entry.time.split(':')[0], 10) : 0;
      return hour >= 12 && hour < 17;
    });
    
    const eveningEntries = entries.filter(entry => {
      const hour = entry.time ? parseInt(entry.time.split(':')[0], 10) : 0;
      return hour >= 17 && hour < 22;
    });
    
    const nightEntries = entries.filter(entry => {
      const hour = entry.time ? parseInt(entry.time.split(':')[0], 10) : 0;
      return hour >= 22 || hour < 5;
    });
    
    // Calculate average mood for each time of day
    const calculateAverage = (entries: typeof moodEntries) => {
      if (entries.length === 0) return 0;
      const sum = entries.reduce((acc, entry) => acc + moodToValue(entry.mood), 0);
      return sum / entries.length;
    };
    
    const morningAvg = calculateAverage(morningEntries);
    const afternoonAvg = calculateAverage(afternoonEntries);
    const eveningAvg = calculateAverage(eveningEntries);
    const nightAvg = calculateAverage(nightEntries);
    
    // Find best and worst times of day
    const timeOfDayScores = [
      { name: 'Morning', avg: morningAvg, count: morningEntries.length },
      { name: 'Afternoon', avg: afternoonAvg, count: afternoonEntries.length },
      { name: 'Evening', avg: eveningAvg, count: eveningEntries.length },
      { name: 'Night', avg: nightAvg, count: nightEntries.length }
    ].filter(time => time.count >= 3); // Only consider times with at least 3 entries
    
    if (timeOfDayScores.length >= 2) {
      // Sort to find best and worst
      const sortedTimes = [...timeOfDayScores].sort((a, b) => b.avg - a.avg);
      const best = sortedTimes[0];
      const worst = sortedTimes[sortedTimes.length - 1];
      
      // Only generate insight if there's a meaningful difference
      if (best.avg - worst.avg >= 0.5) {
        timeInsights.push({
          id: `time-comparison-${Date.now()}`,
          title: `Your mood is typically better during ${best.name.toLowerCase()}`,
          description: `On average, your mood score is ${(best.avg - worst.avg).toFixed(1)} points higher during ${best.name.toLowerCase()} compared to ${worst.name.toLowerCase()}.`,
          icon: <AccessTime />,
          priority: 2,
          date: new Date(),
          category: 'time'
        });
      }
    }
    
    return timeInsights;
  };
  
  const analyzeDayOfWeekPatterns = (entries: typeof moodEntries) => {
    const dayInsights: Insight[] = [];
    
    // Group entries by day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayEntries: { [key: string]: typeof moodEntries } = {};
    
    dayNames.forEach(day => {
      dayEntries[day] = [];
    });
    
    entries.forEach(entry => {
      const dayOfWeek = new Date(entry.date).getDay();
      dayEntries[dayNames[dayOfWeek]].push(entry);
    });
    
    // Calculate average mood for each day
    const dayAverages = dayNames.map(day => {
      const dayEntriesArray = dayEntries[day];
      const count = dayEntriesArray.length;
      
      if (count < 2) return { day, avg: 0, count };
      
      const sum = dayEntriesArray.reduce((acc, entry) => acc + moodToValue(entry.mood), 0);
      return { day, avg: sum / count, count };
    }).filter(day => day.count >= 2); // Only consider days with at least 2 entries
    
    if (dayAverages.length >= 3) {
      // Sort to find best and worst days
      const sortedDays = [...dayAverages].sort((a, b) => b.avg - a.avg);
      const best = sortedDays[0];
      const worst = sortedDays[sortedDays.length - 1];
      
      // Only generate insight if there's a meaningful difference
      if (best.avg - worst.avg >= 0.7) {
        dayInsights.push({
          id: `day-comparison-${Date.now()}`,
          title: `${best.day}s tend to be your best day of the week`,
          description: `Your mood is typically ${(best.avg - worst.avg).toFixed(1)} points higher on ${best.day}s compared to ${worst.day}s.`,
          icon: <CalendarToday />,
          priority: 2,
          date: new Date(),
          category: 'pattern'
        });
      }
      
      // Weekday vs Weekend insight
      const weekdayEntries = [
        ...dayEntries['Monday'], 
        ...dayEntries['Tuesday'], 
        ...dayEntries['Wednesday'], 
        ...dayEntries['Thursday'], 
        ...dayEntries['Friday']
      ];
      
      const weekendEntries = [
        ...dayEntries['Saturday'], 
        ...dayEntries['Sunday']
      ];
      
      if (weekdayEntries.length >= 5 && weekendEntries.length >= 2) {
        const weekdayAvg = weekdayEntries.reduce((acc, entry) => acc + moodToValue(entry.mood), 0) / weekdayEntries.length;
        const weekendAvg = weekendEntries.reduce((acc, entry) => acc + moodToValue(entry.mood), 0) / weekendEntries.length;
        
        if (Math.abs(weekdayAvg - weekendAvg) >= 0.5) {
          const better = weekendAvg > weekdayAvg ? 'weekends' : 'weekdays';
          const diff = Math.abs(weekendAvg - weekdayAvg).toFixed(1);
          
          dayInsights.push({
            id: `weekend-weekday-comparison-${Date.now()}`,
            title: `Your mood is better during ${better}`,
            description: `On average, your mood score is ${diff} points higher during ${better} compared to ${better === 'weekends' ? 'weekdays' : 'weekends'}.`,
            icon: <CalendarToday />,
            priority: 3,
            date: new Date(),
            category: 'pattern'
          });
        }
      }
    }
    
    return dayInsights;
  };
  
  const analyzeActivityPatterns = (entries: typeof moodEntries) => {
    const activityInsights: Insight[] = [];
    
    // Count activities and calculate average mood for each
    const activityData: { [activity: string]: { count: number, sum: number } } = {};
    
    entries.forEach(entry => {
      const moodValue = moodToValue(entry.mood);
      
      entry.activities?.forEach(activity => {
        if (!activityData[activity]) {
          activityData[activity] = { count: 0, sum: 0 };
        }
        
        activityData[activity].count += 1;
        activityData[activity].sum += moodValue;
      });
    });
    
    // Calculate averages and find activities with at least 3 entries
    const activityAverages = Object.entries(activityData)
      .filter(([_, data]) => data.count >= 3)
      .map(([activity, data]) => ({
        activity,
        avg: data.sum / data.count,
        count: data.count
      }))
      .sort((a, b) => b.avg - a.avg);
    
    // Find top activities
    if (activityAverages.length >= 2) {
      const topActivity = activityAverages[0];
      
      activityInsights.push({
        id: `top-activity-${Date.now()}`,
        title: `"${topActivity.activity}" is associated with your best moods`,
        description: `When you log "${topActivity.activity}" (${topActivity.count} times), your average mood score is ${topActivity.avg.toFixed(1)} out of 4.`,
        icon: <DirectionsRun />,
        priority: 1,
        date: new Date(),
        category: 'activity'
      });
      
      // If there are enough different activities, suggest comparison
      if (activityAverages.length >= 4) {
        const bottomActivity = activityAverages[activityAverages.length - 1];
        
        if (topActivity.avg - bottomActivity.avg >= 1) {
          activityInsights.push({
            id: `activity-comparison-${Date.now()}`,
            title: `Consider doing more "${topActivity.activity}" and less "${bottomActivity.activity}"`,
            description: `Your mood is ${(topActivity.avg - bottomActivity.avg).toFixed(1)} points higher on average when you do "${topActivity.activity}" compared to "${bottomActivity.activity}".`,
            icon: <LocalActivity />,
            priority: 3,
            date: new Date(),
            category: 'activity'
          });
        }
      }
    }
    
    return activityInsights;
  };
  
  const analyzeWeatherPatterns = (entries: typeof moodEntries) => {
    const weatherInsights: Insight[] = [];
    
    // Count weather conditions and calculate average mood for each
    const weatherData: { [condition: string]: { count: number, sum: number } } = {};
    
    entries.forEach(entry => {
      if (!entry.weather?.condition) return;
      
      const moodValue = moodToValue(entry.mood);
      const condition = entry.weather.condition;
      
      if (!weatherData[condition]) {
        weatherData[condition] = { count: 0, sum: 0 };
      }
      
      weatherData[condition].count += 1;
      weatherData[condition].sum += moodValue;
    });
    
    // Calculate averages and find conditions with at least 3 entries
    const weatherAverages = Object.entries(weatherData)
      .filter(([_, data]) => data.count >= 3)
      .map(([condition, data]) => ({
        condition,
        avg: data.sum / data.count,
        count: data.count
      }))
      .sort((a, b) => b.avg - a.avg);
    
    // Find weather impact
    if (weatherAverages.length >= 2) {
      const bestWeather = weatherAverages[0];
      const worstWeather = weatherAverages[weatherAverages.length - 1];
      
      if (bestWeather.avg - worstWeather.avg >= 0.5) {
        weatherInsights.push({
          id: `weather-impact-${Date.now()}`,
          title: `${bestWeather.condition} weather may improve your mood`,
          description: `Your mood is typically ${(bestWeather.avg - worstWeather.avg).toFixed(1)} points higher during ${bestWeather.condition.toLowerCase()} weather compared to ${worstWeather.condition.toLowerCase()} weather.`,
          icon: <WbSunny />,
          priority: 3,
          date: new Date(),
          category: 'weather'
        });
      }
    }
    
    return weatherInsights;
  };
  
  const analyzeStreakPatterns = (entries: typeof moodEntries) => {
    const streakInsights: Insight[] = [];
    
    // Look at the last 14 days
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);
    
    const recentEntries = entries.filter(entry => 
      new Date(entry.date) >= twoWeeksAgo
    );
    
    // Calculate recent trend
    if (recentEntries.length >= 5) {
      const recentAvg = recentEntries.reduce((acc, entry) => acc + moodToValue(entry.mood), 0) / recentEntries.length;
      
      // Compare with previous period
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(now.getDate() - 28);
      
      const previousEntries = entries.filter(entry => 
        new Date(entry.date) >= fourWeeksAgo && new Date(entry.date) < twoWeeksAgo
      );
      
      if (previousEntries.length >= 5) {
        const previousAvg = previousEntries.reduce((acc, entry) => acc + moodToValue(entry.mood), 0) / previousEntries.length;
        const difference = recentAvg - previousAvg;
        
        if (Math.abs(difference) >= 0.5) {
          const trend = difference > 0 ? 'improving' : 'declining';
          const priority = difference > 0 ? 2 : 1;
          
          streakInsights.push({
            id: `recent-trend-${Date.now()}`,
            title: `Your mood has been ${trend} recently`,
            description: `Your average mood in the past 2 weeks is ${Math.abs(difference).toFixed(1)} points ${difference > 0 ? 'higher' : 'lower'} than the previous 2 weeks.`,
            icon: difference > 0 ? <TrendingUp /> : <TrendingDown />,
            priority,
            date: new Date(),
            category: 'pattern'
          });
        }
      }
      
      // Check consistency - what percentage of days have entries
      const dayCount = new Set(recentEntries.map(entry => entry.date)).size;
      const consistency = dayCount / 14;
      
      if (consistency >= 0.7) {
        streakInsights.push({
          id: `consistency-${Date.now()}`,
          title: 'You\'ve been consistent with tracking',
          description: `You've logged your mood on ${Math.round(consistency * 100)}% of days in the past 2 weeks. Consistent tracking leads to better insights.`,
          icon: <BookmarkBorder />,
          priority: 4,
          date: new Date(),
          category: 'pattern'
        });
      }
    }
    
    return streakInsights;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Generating Insights...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Analyzing your mood patterns for personalized insights
        </Typography>
      </Box>
    );
  }
  
  if (moodEntries.length < 5) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Not Enough Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You need at least 5 mood entries to generate personalized insights. Keep logging your moods!
        </Typography>
      </Paper>
    );
  }
  
  if (insights.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No Insights Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We couldn't find any significant patterns in your mood data yet. Continue logging your moods regularly to generate insights.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Personalized Insights
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Based on your mood entries, we've identified these patterns and insights that may help you understand your emotional well-being.
      </Typography>
      
      <List sx={{ 
        '& .MuiListItem-root': { 
          mb: 2, 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: { xs: 'flex-start', sm: 'center' } 
        }
      }}>
        {insights.map((insight, index) => (
          <React.Fragment key={insight.id}>
            <ListItem component={Paper} elevation={1} sx={{ 
              p: 2,
              borderLeft: 4, 
              borderColor: getPriorityColor(insight.priority) 
            }}>
              <ListItemIcon sx={{ 
                minWidth: { xs: 0, sm: 56 },
                color: getPriorityColor(insight.priority),
                mr: { xs: 0, sm: 2 },
                mb: { xs: 1, sm: 0 }
              }}>
                {insight.icon}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {insight.title}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={insight.category}
                      sx={{ 
                        ml: 1, 
                        fontSize: '0.7rem',
                        bgcolor: alpha(getPriorityColor(insight.priority), 0.1),
                        color: getPriorityColor(insight.priority)
                      }} 
                    />
                  </Box>
                }
                secondary={insight.description}
                secondaryTypographyProps={{ 
                  component: 'div',
                  variant: 'body2',
                  sx: { mt: 0.5, color: 'text.primary' }
                }}
              />
            </ListItem>
            
            {index < insights.length - 1 && (
              <Box sx={{ height: 8 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default PersonalizedInsights; 